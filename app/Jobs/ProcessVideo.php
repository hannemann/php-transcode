<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Events\FFMpegProgress;
use App\Http\Requests\FFMpegActionRequest;
use App\Models\FFMpeg\Actions\Concat;
use App\Models\FFMpeg\Actions\Transcode;
use App\Models\FFMpeg\Actions\RemuxTS;
use App\Models\FFMpeg\Actions\RemuxMP4;
use App\Models\FFMpeg\Actions\RemuxMKV;
use App\Models\FFMpeg\Actions\Scale;
use App\Models\FFMpeg\Actions\ConcatPrepare;
use App\Models\FFMpeg\Actions\Crop;
use App\Models\FFMpeg\Actions\DelogoCPU;
use App\Models\FFMpeg\Actions\RemovelogoCPU;
use Throwable;
use App\Models\CurrentQueue;
use App\Models\FFMpeg\Actions\ConcatMP4;
use App\Models\FFMpeg\Actions\ScaleCPU;
use App\Models\FFMpeg\Actions\CropCPU;
use ProtoneMedia\LaravelFFMpeg\Exporters\EncodingException;

class ProcessVideo implements ShouldQueue //, ShouldBeUnique
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected string $type;

    protected string $path;

    protected string $disk;

    protected array $streams;

    protected int $current_queue_id;

    protected array $requestData;

    public int $tries = 1;

    //TODO: should be config option
    public int $timeout = 3600;

    private bool $hasFailed = false;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct(
        string $type,
        string $disk,
        string $path,
        FFMpegActionRequest $request
    ) {
        $this->type = $type;
        $this->path = $path;
        $this->disk = $disk;
        $this->requestData = $request->input();
        $this->onQueue('ffmpeg');
        $currentQueue = new CurrentQueue([
            'path' => $this->path,
            'streams' => $request->input('streams') ?? [],
            'clips' => json_encode($request->input('clips') ?? []),
            'type' => $this->type,
            'state' => CurrentQueue::STATE_PENDING,
            'percentage' => 0,
            'rate' => 0,
            'remaining' => 0,
            'start' => 0,
            'end' => -1
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
        $queue = CurrentQueue::where('id', $this->current_queue_id)->firstOrFail();
        if ($queue->state !== CurrentQueue::STATE_CANCELED) {
            CurrentQueue::where('id', $this->current_queue_id)->update([
                'state' => CurrentQueue::STATE_RUNNING,
                'start' => gmdate('Y-m-d\TH:i:s\Z'),
            ]);
            FFMpegProgress::dispatch('queue.progress');
            switch($this->type) {
                case 'concat':
                    switch ($this->requestData['container']) {
                        case 'mp4':
                            $model = ConcatMP4::class;
                            break;
                        case 'mkv':
                            $model = Concat::class;
                            break;
                    }
                    break;
                case 'transcode':
                    $model = Transcode::class;
                    break;
                case 'scale':
                    $model = Scale::class;
                    break;
                case 'ScaleCPU':
                    $model = ScaleCPU::class;
                    break;
                case 'crop':
                    $model = Crop::class;
                    break;
                case 'cropCPU':
                    $model = CropCPU::class;
                    break;
                case 'delogoCPU':
                    $model = DelogoCPU::class;
                    break;
                case 'removelogoCPU':
                    $model = RemovelogoCPU::class;
                    break;
                case 'prepare':
                    $model = ConcatPrepare::class;
                    break;
                case 'remux':
                    switch ($this->requestData['container']) {
                        case 'mp4':
                            $model = RemuxMP4::class;
                            break;
                        case 'mkv':
                            $model = RemuxMKV::class;
                            break;
                        case 'ts':
                            $model = RemuxTS::class;
                            break;
                    }
                    break;
            }
            (new $model($this->disk, $this->path, $this->current_queue_id, $this->requestData))->execute($this);
            if (!$this->hasFailed) {
                CurrentQueue::where('id', $this->current_queue_id)->update([
                    'state' => CurrentQueue::STATE_DONE,
                    'end' => gmdate('Y-m-d\TH:i:s\Z'),
                ]);
            }
        }
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
        $this->hasFailed = true;
        $message = $exception->getMessage();
        if ($exception instanceOf EncodingException) {
            $command = $exception->getCommand();
            $errorLog = $exception->getErrorOutput();
            $message = sprintf("%s\n\n%s", $command, $errorLog);
        }
        CurrentQueue::where('id', $this->current_queue_id)
            ->update([
                'state' => CurrentQueue::STATE_FAILED,
                'exception' => $message,
                'end' => gmdate('Y-m-d\TH:i:s\Z')
            ]);
        FFMpegProgress::dispatch('queue.progress');
    }
}
