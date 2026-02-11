<?php

use App\Http\Requests\PrecognitionFormRequest;
use Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Route;
use App\Models\Todo;
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

// @deprecated - We now have a InfiniteScroll component and Inertia::scroll() method...
Route::get('/infinite-scroll', function () {
    $page = request()->integer('page', 1);
    $perPage = 25;
    $start = ($page - 1) * $perPage;
    $end = $start + $perPage;
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

Route::get('/form-component', function () {
    return inertia('FormComponent', [
        'foo' => fn () => now()->getTimestampMs(),
        'bar' => fn () => now()->getTimestampMs(),
        'quux' => fn () => now()->getTimestampMs(),
    ]);
});

Route::post('/form-component', function () {
    $data = request()->validateWithBag('custom-bag', [
        'name' => ['required', 'string', 'max:255'],
        'avatar' => ['nullable', 'file', 'image', 'max:2048'],
        'skills' => ['nullable', 'array', 'min:2'],
        'skills.*' => ['string', 'in:vue,react,laravel,tailwind'],
        'tags' => ['nullable', 'array'],
        'tags.*' => ['string', 'max:50'],
        'user.address.street' => ['nullable', 'string', 'max:255'],
        'user.address.city' => ['nullable', 'string', 'max:255'],
    ]);

    // Simulate file upload progress
    if (request()->hasFile('avatar')) {
        sleep(1);
    }

    return back();
});

Route::get('/form-component/precognition', function () {
    return inertia('FormComponentPrecognition');
});

Route::post('/form-component/precognition', function (PrecognitionFormRequest $request) {
    $data = $request->validated();

    // dd($data);

    return back();
})->middleware([HandlePrecognitiveRequests::class]);

Route::get('/photo-grid/{horizontal?}', function ($horizontal = null) {
    if (request()->header('X-Inertia-Partial-Component')) {
        // Simulate latency for partial reloads
        usleep(250_000);
    }

    $perPage = 24;
    $pages = 30;
    $total = $perPage * $pages;
    $page = request()->integer('page', 1);

    $photos = collect()
        ->range(1, $total)
        ->forPage($page, $perPage)
        ->map(fn ($i) => [
            'id' => $i,
            'url' => "https://picsum.photos/id/{$i}/300/300",
        ])
        ->pipe(fn ($photos) => new LengthAwarePaginator(
            $photos->values(),
            $total,
            $perPage,
            $page,
        ));

    return inertia($horizontal ? 'PhotoHorizontal' : 'PhotoGrid', [
        'photos' => Inertia::scroll($photos),
    ]);
});

Route::get('/data-table', function () {
    if (request()->header('X-Inertia-Partial-Component')) {
        // Simulate latency for partial reloads
        usleep(500_000);
    }

    $perPage = 200;
    $pages = 30;
    $total = $perPage * $pages;
    $page = request()->integer('page', 1);

    $users = collect()
        ->range(1, $total)
        ->forPage($page, $perPage)
        ->map(fn ($i) => [
            'id' => $i,
            'name' => "User {$i}",
        ])
        ->pipe(fn ($photos) => new LengthAwarePaginator(
            $photos->values(),
            $total,
            $perPage,
            $page,
        ));

    return inertia('DataTable', [
        'users' => Inertia::scroll($users),
    ]);
});

Route::get('/once/{page}', function (int $page) {
    $component = match ($page) {
        1 => 'Once/First',
        2 => 'Once/Second',
        3 => 'Once/Third',
        4 => 'Once/Fourth',
        default => abort(404),
    };

    return inertia($component, [
        'foo' => Inertia::once(fn () => 'foo value: '.now()->getTimestampMs())->fresh($page === 3),
        'bar' => Inertia::once(fn () => 'bar value: '.now()->getTimestampMs())->until(10),
        'baz' . $page => Inertia::once(fn () => 'baz value: '.now()->getTimestampMs())->as('baz'),
        'qux' => Inertia::defer(fn () => 'qux value: '.now()->getTimestampMs())->once(),
    ]);
});

Route::get('/optimistic', function () {
    return inertia('Optimistic', ['todos' => Todo::all()]);
});

Route::post('/optimistic', function () {
    request()->validate(['name' => ['required', 'string', 'min:3']]);

    Todo::create(['name' => request('name')]);

    return back();
});

Route::patch('/optimistic/{todo}', function (Todo $todo) {
    $todo->update(['done' => ! $todo->done]);

    return back();
});

Route::delete('/optimistic/{todo}', function (Todo $todo) {
    $todo->delete();

    return back();
});

Route::post('/optimistic/reset', function () {
    Todo::truncate();

    return redirect('/optimistic');
});

Route::get('/flash', function () {
    return inertia('Flash');
});

Route::get('/flash/direct', function () {
    return Inertia::flash('message', 'Sent with render!')->render('Flash');
});

Route::post('/flash/form', function () {
    return Inertia::flash('message', 'Sent with redirect!')->back();
});

Route::get('/ssr-debug', fn () => inertia('SsrDebug'));
Route::get('/ssr-debug/window', fn () => inertia('SsrDebug/WindowError'));
Route::get('/ssr-debug/document', fn () => inertia('SsrDebug/DocumentError'));
Route::get('/ssr-debug/localstorage', fn () => inertia('SsrDebug/LocalStorageError'));
