<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Events\FFMpegProcess as FFMpegProcessEvent;
use App\Models\FFMpeg\Concat;
use App\Models\FFMpeg\Transcode;
use App\Models\FFMpeg\RemuxTS;
use Throwable;
use App\Models\CurrentQueue;

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
        ]);
        $currentQueue->save();
        $this->current_queue_id = $currentQueue->getKey();
        FFMpegProcessEvent::dispatch($this->type . '.' . CurrentQueue::STATE_PENDING, $this->path);
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        FFMpegProcessEvent::dispatch($this->type . '.' . CurrentQueue::STATE_RUNNING, $this->path);
        CurrentQueue::where('id', $this->current_queue_id)->update(['state' => CurrentQueue::STATE_RUNNING]);
        switch($this->type) {
            case 'concat':
                (new Concat($this->disk, $this->path, $this->current_queue_id))->execute();
                break;
            case 'transcode':
                (new Transcode($this->disk, $this->path, $this->streams, $this->current_queue_id, $this->clips))->execute();
                break;
            case 'remux':
                (new RemuxTS($this->disk, $this->path, $this->current_queue_id))->execute();
                break;
        }
        CurrentQueue::where('id', $this->current_queue_id)->update(['state' => CurrentQueue::STATE_DONE]);
        FFMpegProcessEvent::dispatch($this->type . '.' . CurrentQueue::STATE_DONE, $this->path);
    }

    /**
     * Handle a job failure.
     *
     * @param  \Throwable  $exception
     * @return void
     */
    public function failed(Throwable $exception)
    {
        CurrentQueue::where('id', $this->current_queue_id)
            ->update([
                'state' => CurrentQueue::STATE_FAILED,
                'exception' => $exception->getMessage()
            ]);
        FFMpegProcessEvent::dispatch($this->type . '.' . CurrentQueue::STATE_FAILED, $this->path, ['exception' => $exception->getMessage()]);
    }
}
