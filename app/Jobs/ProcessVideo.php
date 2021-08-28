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
use Throwable;

class ProcessVideo implements ShouldQueue, ShouldBeUnique
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected string $type;

    protected string $path;

    protected string $disk;

    protected ?string $clipStart = null;

    protected ?string $clipEnd = null;

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
        string $clipStart = null,
        string $clipEnd = null
    ) {
        $this->type = $type;
        $this->path = $path;
        $this->disk = $disk;
        $this->clipStart = $clipStart;
        $this->clipEnd = $clipEnd;
        $this->onQueue('ffmpeg');
        FFMpegProcessEvent::dispatch($this->type . '.pending', $this->path);
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        FFMpegProcessEvent::dispatch($this->type . '.running', $this->path);
        switch($this->type) {
            case 'concat':
                (new Concat($this->disk, $this->path))->execute();
                break;
            case 'transcode':
                (new Transcode($this->disk, $this->path, $this->clipStart, $this->clipEnd))->execute();
                break;
        }
        FFMpegProcessEvent::dispatch($this->type . '.done', $this->path);
    }

    /**
     * Handle a job failure.
     *
     * @param  \Throwable  $exception
     * @return void
     */
    public function failed(Throwable $exception)
    {
        FFMpegProcessEvent::dispatch($this->type . '.failed', $this->path, ['exception' => $exception->getMessage()]);
    }
}
