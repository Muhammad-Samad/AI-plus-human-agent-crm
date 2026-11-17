<?php

use Illuminate\Support\Facades\Route;

// Route::get('/', function () {
//     return view('welcome');
// });

Route::get('/', fn () => redirect()->route('agent.dashboard'));
Route::view('/agent', 'agent.dashboard')->name('agent.dashboard');
Route::view('/chat-demo', 'customer.chat-demo')->name('customer.chat-demo');
