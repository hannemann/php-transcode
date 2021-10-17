<?php

namespace App\Events\Transcode\Config;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;

class Streams implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Collection $streams;

    public array $format;

    public array $crop;

    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct(array $format, array $streams, array $crop)
    {
        $this->format = $format;
        $this->streams = collect($streams)->map(fn($stream) => $stream->all());
        $this->crop = $crop;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn()
    {
        return new Channel('Transcode.Config');
    }

    public function broadcastAs()
    {
        return 'App\Events\Transcode\Config';
    }
}
