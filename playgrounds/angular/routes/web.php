<?php

use App\Http\Requests\PrecognitionFormRequest;
use Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn () => inertia('Home'));

Route::get('/users', fn () => inertia('Users', [
    'users' => collect(range(1, 12))->map(fn ($id) => [
        'id' => $id,
        'name' => "User {$id}",
        'email' => "user{$id}@example.com",
    ]),
]));

Route::get('/form', fn () => inertia('Form'));
Route::post('/form', function (Request $request) {
    $request->validate(['name' => ['required', 'string', 'max:255']]);

    return back();
});

Route::get('/precognition', fn () => inertia('Precognition'));
Route::post('/precognition', function (PrecognitionFormRequest $request) {
    $request->validate(['email' => ['required', 'email']]);

    return back();
})->middleware(HandlePrecognitiveRequests::class);

Route::get('/defer', fn () => inertia('Defer', [
    'stats' => Inertia::defer(fn () => ['users' => 12]),
]));

Route::get('/poll', fn () => inertia('Poll', ['now' => now()->toIso8601String()]));

$contacts = fn () => collect(range(1, 5))->map(fn ($id) => [
    'id' => $id,
    'name' => "Contact {$id}",
    'favorite' => false,
]);
Route::get('/optimistic', fn () => inertia('Optimistic', ['contacts' => $contacts()]));
Route::post('/optimistic', fn () => back());

Route::get('/infinite-scroll', function () {
    $page = request()->integer('page', 1);
    $perPage = 15;
    $users = collect(range(1, 90))->forPage($page, $perPage)->map(fn ($id) => [
        'id' => $id,
        'name' => "User {$id}",
        'email' => "user{$id}@example.com",
    ])->values();

    return inertia('InfiniteScroll', [
        'users' => Inertia::scroll(new LengthAwarePaginator($users, 90, $perPage, $page)),
    ]);
});
