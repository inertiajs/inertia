<?php

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return inertia('Home');
});

Route::get('/users', function () {
    sleep(2);

    return inertia('Users', [
        'date' => now()->toDateTimeString(),
        'users' => collect([
            [
                'id' => 1,
                'name' => 'Jonathan Reinink',
                'email' => 'jonathan@example.com',
            ],
            [
                'id' => 2,
                'name' => 'Adam Wathan',
                'email' => 'adam@example.com',
            ],
            [
                'id' => 3,
                'name' => 'Taylor Otwell',
                'email' => 'taylor@example.com',
            ],
            [
                'id' => 4,
                'name' => 'Jordan Pittman',
                'email' => 'jordan@example.com',
            ],
            [
                'id' => 5,
                'name' => 'Jess Archer',
                'email' => 'jess@example.com',
            ],
            [
                'id' => 6,
                'name' => 'Claudio Dekker',
                'email' => 'claudio@example.com',
            ],
            [
                'id' => 7,
                'name' => 'Sebastian De Deyne',
                'email' => 'sebastian@example.com',
            ],
            [
                'id' => 8,
                'name' => 'Pedro Borges',
                'email' => 'pedro@example.com',
            ],
        ])->shuffle()->values(),
    ]);
});

Route::get('/users/2', function () {
    sleep(2);

    return inertia('Users', [
        'date' => now()->toDateTimeString(),
        'users' => [
            [
                'id' => 1,
                'name' => 'Jonathan Reinink',
                'email' => 'jonathan@example.com',
            ],
            [
                'id' => 2,
                'name' => 'Adam Wathan',
                'email' => 'adam@example.com',
            ],
            [
                'id' => 3,
                'name' => 'Taylor Otwell',
                'email' => 'taylor@example.com',
            ],
            [
                'id' => 4,
                'name' => 'Jordan Pittman',
                'email' => 'jordan@example.com',
            ],
            [
                'id' => 5,
                'name' => 'Jess Archer',
                'email' => 'jess@example.com',
            ],
            [
                'id' => 6,
                'name' => 'Claudio Dekker',
                'email' => 'claudio@example.com',
            ],
            [
                'id' => 7,
                'name' => 'Sebastian De Deyne',
                'email' => 'sebastian@example.com',
            ],
            [
                'id' => 8,
                'name' => 'Pedro Borges',
                'email' => 'pedro@example.com',
            ],
        ],
    ]);
});

Route::get('/article', function () {
    Inertia::encryptHistory();

    return inertia('Article');
});

Route::get('/form', function () {
    return inertia('Form');
});

Route::post('/user', function () {
    return inertia('User', [
        'user' => request()->validate([
            'name' => ['required'],
            'company' => ['required'],
            'role' => ['required', 'in:User,Admin,Super'],
        ]),
    ]);
});

Route::get('/login', function () {
    return inertia('Login');
});

Route::get('/async', function () {
    return inertia('Async', [
        'sleep' => Inertia::lazy(function () {
            sleep(4);
        }),
        'jonathan' => Cache::get('jonathan', false),
        'taylor' => Cache::get('taylor', false),
        'joe' => Cache::get('joe', false),
    ]);
});

Route::get('/infinite-scroll', function () {
    $page = request()->integer('page', 1);
    $perPage = 25;
    $start = ($page - 1) * $perPage;
    $end = $start + $perPage - 1;
    $itemTypes = ['user', 'food', 'animal', 'plant'];
    $itemType = request()->input('item_type', $itemTypes[0]);

    return inertia('InfiniteScroll', [
        'items' => Inertia::defer(
            function () use ($start, $end, $itemType) {
                sleep(1);

                return collect(range($start, $end))->map(fn ($i) => [
                    'id' => $i,
                    'name' => ucwords($itemType).' '.$i,
                ])->toArray();
            }
        )->merge(),
        'page' => $page,
        'item_type' => $itemType,
        'item_types' => $itemTypes,
    ]);
});

Route::post('/async/checkbox', function () {
    sleep(2);
    $previousJoe = Cache::get('joe', false);

    Cache::put('jonathan', request('jonathan'), 10);
    Cache::put('taylor', request('taylor'), 10);
    Cache::put('joe', request('joe'), 10);

    if (! $previousJoe && request()->boolean('joe')) {
        return redirect('article');
    }

    return redirect('/async');
});

Route::get('/defer', function () {
    info('defer route');

    return inertia('Defer', [
        'users' => Inertia::defer(function () {
            sleep(1);

            return [
                [
                    'id' => 1,
                    'name' => 'Jonathan Reinink',
                    'email' => 'hello@reinink.com',
                ],
                [
                    'id' => 2,
                    'name' => 'Taylor Otwell',
                    'email' => 'howdy@otwell.biz',
                ],
                [
                    'id' => 3,
                    'name' => 'Joe Tannenbaum',
                    'email' => 'yo@tannenbaum.edu',
                ],
            ];
        }, 'u'),
        'foods' => Inertia::defer(function () {
            sleep(3);

            return [
                [
                    'id' => 1,
                    'name' => 'Pizza',
                ],
                [
                    'id' => 2,
                    'name' => 'Tacos',
                ],
                [
                    'id' => 3,
                    'name' => 'Sushi',
                ],
            ];
        }, 'f'),
        'organizations' => Inertia::defer(function () {
            sleep(2);

            return [
                [
                    'id' => 1,
                    'name' => 'InertiaJS',
                    'url' => 'https://inertiajs.com',
                ],
                [
                    'id' => 2,
                    'name' => 'Laravel',
                    'url' => 'https://laravel.com',
                ],
                [
                    'id' => 3,
                    'name' => 'VueJS',
                    'url' => 'https://vuejs.org',
                ],
            ];
        }, 'o'),
        'surprise' => Inertia::optional(function () {
            sleep(2);

            return [
                [
                    'id' => 1,
                    'name' => 'Surprise!',
                ],
                [
                    'id' => 2,
                    'name' => 'Aha!',
                ],
                [
                    'id' => 3,
                    'name' => 'Gotcha!',
                ],
                [
                    'id' => 4,
                    'name' => '👋!',
                ],
            ];
        }),
        'dogs' => Inertia::optional(function () {
            sleep(1);

            return [
                [
                    'id' => 1,
                    'name' => '🐕',
                ],
                [
                    'id' => 2,
                    'name' => '🐩',
                ],
                [
                    'id' => 3,
                    'name' => '🐶',
                ],
            ];
        }),
        'lunch' => Inertia::optional(function () {
            sleep(1);

            return [
                [
                    'id' => 1,
                    'name' => '🍔',
                ],
                [
                    'id' => 2,
                    'name' => '🍟',
                ],
                [
                    'id' => 3,
                    'name' => '🥤',
                ],
            ];
        }),
    ]);
});

Route::get('/goodbye', function () {
    return Inertia::location('https://inertiajs.com/redirects');
});

Route::get('/poll', function () {
    return inertia('Poll', [
        'users' => collect([
            'Jonathan Reinink',
            'Taylor Otwell',
            'Joe Tannenbaum',
            'Jess Archer',
            'Claudio Dekker',
            'Sebastian De Deyne',
            'Pedro Borges',
        ])->shuffle()->take(3)->values(),
        'companies' => collect([
            'InertiaJS',
            'Laravel',
            'VueJS',
            'Tailwind CSS',
            'AlpineJS',
            'Livewire',
            'Spatie',
        ])->shuffle()->take(3)->values(),
    ]);
});

Route::get('/elsewhere', function () {
    return inertia('Users');
});

Route::get('/sleepy/{duration}', function ($duration) {
    sleep($duration);

    return inertia('Users');
});

Route::post('/sleepy/{duration}', function ($duration) {
    sleep($duration);

    return inertia('Article');
});

Route::post('/logout', function () {
    return redirect('/login');
});
