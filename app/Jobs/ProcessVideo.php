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
use Throwable;

class ProcessVideo implements ShouldQueue, ShouldBeUnique
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected string $type;

    protected string $path;

    protected string $disk;

    public int $tries = 1;

    //TODO: should be config option
    public int $timeout = 3600;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct(string $type, string $disk, string $path)
    {
        $this->type = $type;
        $this->path = $path;
        $this->disk = $disk;
        $this->onQueue('ffmpeg');
        FFMpegProcessEvent::dispatch('concat.pending', $this->path);
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        switch($this->type) {
            case 'concat':
                FFMpegProcessEvent::dispatch('concat.running', $this->path);
                (new Concat($this->disk, $this->path))->execute();
                FFMpegProcessEvent::dispatch('concat.done', $this->path);
                break;
        }
    }

    /**
     * Handle a job failure.
     *
     * @param  \Throwable  $exception
     * @return void
     */
    public function failed(Throwable $exception)
    {
        FFMpegProcessEvent::dispatch('concat.failed', $this->path, ['exception' => $exception->getMessage()]);
    }
}
