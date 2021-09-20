<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Events\FFMpegProgress;
use App\Models\FFMpeg\Concat;
use App\Models\FFMpeg\Transcode;
use App\Models\FFMpeg\RemuxTS;
use App\Models\FFMpeg\RemuxMP4;
use Throwable;
use App\Models\CurrentQueue;
use App\Models\FFMpeg\ConcatPrepare;
use ProtoneMedia\LaravelFFMpeg\Exporters\EncodingException;

class ProcessVideo implements ShouldQueue //, ShouldBeUnique
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected string $type;

    protected string $path;

    protected string $disk;

    protected array $streams;

    protected ?array $clips = null;

    protected int $current_queue_id;

    public int $tries = 1;

    //TODO: should be config option
    public int $timeout = 3600;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct(
        string $type,
        string $disk,
        string $path,
        array $streams,
        array $clips = null
    ) {
        $this->type = $type;
        $this->path = $path;
        $this->disk = $disk;
        $this->streams = $streams;
        $this->clips = $clips;
        $this->onQueue('ffmpeg');
        $currentQueue = new CurrentQueue([
            'path' => $this->path,
            'streams' => $this->streams,
            'clips' => json_encode($this->clips),
            'type' => $this->type,
            'state' => CurrentQueue::STATE_PENDING,
            'percentage' => 0,
            'rate' => 0,
            'remaining' => 0,
        ]);
        $currentQueue->save();
        FFMpegProgress::dispatch('queue.progress');
        $this->current_queue_id = $currentQueue->getKey();
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        CurrentQueue::where('id', $this->current_queue_id)->update(['state' => CurrentQueue::STATE_RUNNING]);
        FFMpegProgress::dispatch('queue.progress');
        switch($this->type) {
            case 'concat':
                (new Concat($this->disk, $this->path, $this->current_queue_id))->execute();
                break;
            case 'transcode':
                (new Transcode($this->disk, $this->path, $this->current_queue_id, $this->streams, $this->clips))->execute();
                break;
            case 'remux':
                (new RemuxMP4($this->disk, $this->path, $this->current_queue_id))->execute();
                break;
            case 'prepare':
                (new ConcatPrepare($this->disk, $this->path, $this->current_queue_id, $this->streams))->execute();
                break;
        }
        CurrentQueue::where('id', $this->current_queue_id)->update(['state' => CurrentQueue::STATE_DONE]);
        FFMpegProgress::dispatch('queue.progress');
    }

    /**
     * Handle a job failure.
     *
     * @param  \Throwable  $exception
     * @return void
     */
    public function failed(Throwable $exception)
    {
        $message = $exception->getMessage();
        if ($exception instanceOf EncodingException) {
            $command = $exception->getCommand();
            $errorLog = $exception->getErrorOutput();
            $message = sprintf("%s\n\n%s", $command, $errorLog);
        }
        CurrentQueue::where('id', $this->current_queue_id)
            ->update([
                'state' => CurrentQueue::STATE_FAILED,
                'exception' => $message
            ]);
        FFMpegProgress::dispatch('queue.progress');
    }
}
