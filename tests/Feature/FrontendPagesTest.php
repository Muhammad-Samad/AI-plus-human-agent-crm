<?php

namespace Tests\Feature;

use Tests\TestCase;

class FrontendPagesTest extends TestCase
{
    public function test_agent_dashboard_page_is_available(): void
    {
        $this->get('/agent')->assertOk()->assertSee('NAHEED CUSTOMER CARE')->assertSee('Inbox');
    }

    public function test_customer_chat_preview_page_is_available(): void
    {
        $this->get('/chat-demo')->assertOk()->assertSee('Naheed Support')->assertSee('Start chatting');
    }
}
