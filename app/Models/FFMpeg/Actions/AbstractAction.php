<?php

namespace App\Models\FFMpeg\Actions;

use App\Events\FFMpegProgress;
use App\Events\FilePicker as EventsFilePicker;
use App\Models\CurrentQueue;
use App\Models\FilePicker;
use ProtoneMedia\LaravelFFMpeg\Exporters\MediaExporter;

use Alchemy\BinaryDriver\Listeners\DebugListener;
use App\Events\FFMpegOut;
use App\Http\Requests\FFMpegActionRequest;

/**
 * @property MediaExporter $mediaExporter
 */
class AbstractAction
{
    protected string $disk;
    protected string $path;
    protected int $current_queue_id;
    protected ?array $codecConfig = [];
    protected ?array $clips = [];
    protected string $pathHash;
    protected array $requestData;
    private $processOutSecond = 0;
    private $progressOutSecond = 0;

    public function __construct(string $disk, string $path, int $current_queue_id, array $requestData)
    {
        $this->disk = $disk;
        $this->path = $path;
        $this->current_queue_id = $current_queue_id;
        $this->requestData = $requestData;
        $this->format = new $this->formatClass();
        $this->codecConfig = $requestData['streams'] ?? [];
        $this->clips = $requestData['clips'] ?? [];
        $this->pathHash = sha1($this->path);
    }

    /**
     * export file
     */
    protected function export(): void
    {
        $this->driver = $this->mediaExporter->getFFMpegDriver();
        $this->mediaExporter->addListener(new DebugListener());
        $this->driver->on('debug', \Closure::fromCallable([$this, 'broadcastProcessOutput']));
        $this->mediaExporter
            ->onProgress(\Closure::fromCallable([$this, 'saveProgress']))
            ->inFormat($this->format)
            ->beforeSaving(\Closure::fromCallable([$this, 'updateCommands']))
            ->save($this->getOutputFilename());
    }

    /**
     * initialize stream collections
     */
    protected function initStreams(): void
    {
        $this->streams = collect($this->media->getStreams());
        $this->video = $this->streams->filter(fn($stream) => $stream->get('codec_type') === 'video')
            ->map(fn($stream) => $stream->get('index'))->values();
        $this->audio = $this->streams->filter(fn($stream) => $stream->get('codec_type') === 'audio')
            ->map(fn($stream) => $stream->get('index'))->values();
        $this->subtitle = $this->streams->filter(fn($stream) => $stream->get('codec_type') === 'subtitle')
            ->map(fn($stream) => $stream->get('index'))->values();
    }

    /**
     * obtain output filename
     */
    public function getOutputFilename(): string
    {
        $path = rtrim(dirname($this->path), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
        return sprintf(
            '%s%s.%s.%s',
            $path,
            sha1($this->path),
            $this->filenameAffix,
            $this->filenameSuffix
        );
    }

    protected function calculateProgress(int $percentage): int
    {
        return $percentage;
    }

    /**
     * calculate progress and update queue
     */
    protected function saveProgress(int $percentage, int $remaining, int $rate): void
    {
        $percentage = $this->calculateProgress($percentage);
        CurrentQueue::where('id', $this->current_queue_id)->update([
            'percentage' => $percentage,
            'remaining' => $remaining,
            'rate' => $rate,
        ]);
        
        FFMpegProgress::dispatch('queue.progress');

        $progressOutSecond = time();
        if ($progressOutSecond > $this->progressOutSecond) {
            $this->progressOutSecond = $progressOutSecond;
            $items = FilePicker::root('recordings')::getItems(dirname($this->path));
            $items = $items->map(function($item) {
                $item['in_progress'] = $item['name'] === basename($this->getOutputFilename());
                return $item;
            });
            EventsFilePicker::dispatch($items, dirname($this->path), true);
        }
    }

    protected function broadcastProcessOutput(string $line): void
    {
        $processOutSecond = time();
        if ($processOutSecond > $this->processOutSecond && strpos($line, '[ERROR] frame=') === 0) {
            $this->processOutSecond = $processOutSecond;
            $lines = explode('\n', $line);
            $line = array_pop($lines);
            FFMpegOut::dispatch($this->pathHash, str_replace('[ERROR] ', '', $line));
        }
    }
}