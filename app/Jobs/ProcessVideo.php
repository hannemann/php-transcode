<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Events\FfmpegDone as FfmpegDoneEvent;
use App\Models\FFMpeg\Concat;

class ProcessVideo implements ShouldQueue, ShouldBeUnique
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected string $type;

    protected string $path;

    protected string $disk;

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
                (new Concat($this->disk, $this->path))->execute();
                FfmpegDoneEvent::dispatch('concat', $this->path);
                break;
        }
    }
}
