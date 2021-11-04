<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\FFMpeg\Player\Hls;
use Throwable;

class Player implements ShouldQueue //, ShouldBeUnique
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected string $path;

    protected string $disk;

    protected array $config;

    public int $tries = 1;

    //TODO: should be config option
    public int $timeout = 14400;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct(string $disk, string $path, array $config) {
        $this->disk = $disk;
        $this->path = $path;
        $this->config = $config;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        (new Hls())->stream($this->disk, $this->path, $this->config);
    }

    /**
     * Handle a job failure.
     *
     * @param  \Throwable  $exception
     * @return void
     */
    public function failed(Throwable $exception)
    {}
}
