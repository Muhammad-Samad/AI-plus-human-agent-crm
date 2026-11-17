<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AiTyping implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public readonly string $conversationUuid,
        public readonly bool   $isTyping,
    ) {}

    /**
     * Get the channels the event should broadcast on.
     * Uses the UUID channel like every other conversation event, so the
     * customer widget and agent dashboard actually receive it.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('conversation.' . $this->conversationUuid),
        ];
    }

    public function broadcastAs(): string
    {
        return 'ai.typing';
    }

    public function broadcastWith(): array
    {
        return [
            'conversation_uuid' => $this->conversationUuid,
            'is_typing'         => $this->isTyping,
        ];
    }
}