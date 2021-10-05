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
use Throwable;
use App\Models\CurrentQueue;
use App\Models\FFMpeg\Actions\ConcatPrepare;
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
                (new Concat($this->disk, $this->path, $this->current_queue_id, $this->requestData))->execute();
                break;
            case 'transcode':
                (new Transcode($this->disk, $this->path, $this->current_queue_id, $this->requestData))->execute();
                break;
            case 'remux':
                switch ($this->requestData['container']) {
                    case 'mp4':
                        (new RemuxMP4($this->disk, $this->path, $this->current_queue_id, $this->requestData))->execute();
                        break;
                    case 'mkv':
                        (new RemuxMKV($this->disk, $this->path, $this->current_queue_id, $this->requestData))->execute();
                        break;
                    case 'ts':
                        (new RemuxTS($this->disk, $this->path, $this->current_queue_id, $this->requestData))->execute();
                        break;
                }
                break;
            case 'scale':
                (new Scale($this->disk, $this->path, $this->current_queue_id, $this->requestData))->execute();
                break;
            case 'prepare':
                (new ConcatPrepare($this->disk, $this->path, $this->current_queue_id, $this->requestData))->execute();
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
