<?php

namespace App\Providers;

use Illuminate\Foundation\Vite;
use Illuminate\Support\HtmlString;
use Illuminate\Support\Js;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->singleton(Vite::class, fn () => new class extends Vite
        {
            /**
             * The prefetching strategy to use.
             *
             * @var 'waterfall'|'aggressive'
             */
            protected $prefetchStrategy = 'waterfall';

            /**
             * When using the "waterfall" strategy, the count of assets to load at one time.
             *
             * @param int
             */
            protected $prefetchChunks = 3;

            /**
             * Set the prefetching strategy.
             *
             * @param  'waterfall'|'aggressive'  $strategy
             * @param  ...mixed  $config
             */
            public function usePrefetchStrategy(string $strategy, mixed ...$config): static
            {
                $this->prefetchStrategy = $strategy;

                if ($strategy === 'waterfall') {
                    $this->prefetchChunks = $config[0] ?? 3;
                }

                return $this;
            }

            /**
             * Generate Vite tags for an entrypoint.
             *
             * @param  string|string[]  $entrypoints
             * @param  string|null  $buildDirectory
             * @return \Illuminate\Support\HtmlString
             */
            public function __invoke($entrypoints, $buildDirectory = null)
            {
                $manifest = $this->manifest($buildDirectory ??= $this->buildDirectory);
                $base = parent::__invoke($entrypoints, $buildDirectory);

                if ($this->isRunningHot()) {
                    return $base;
                }

                return collect($entrypoints)
                    ->flatMap(fn ($entrypoint) => collect($manifest[$entrypoint]['dynamicImports'] ?? [])
                        ->map(fn ($import) => $manifest[$import])
                        ->filter(fn ($chunk) => str_ends_with($chunk['file'], '.js') || str_ends_with($chunk['file'], '.css'))
                        ->flatMap($resolveImportChunks = function ($chunk) use (&$resolveImportChunks, $manifest) {
                            return collect([...$chunk['imports'] ?? [], ...$chunk['dynamicImports'] ?? []])
                                ->reduce(
                                    fn ($chunks, $import) => $chunks->merge(
                                        $resolveImportChunks($manifest[$import])
                                    ),
                                    collect([$chunk])
                                )
                                ->merge(collect($chunk['css'] ?? [])->map(
                                    fn ($css) => collect($manifest)->first(fn ($chunk) => $chunk['file'] === $css) ?? [
                                        'file' => $css,
                                    ],
                                ));
                        })
                        ->map(function ($chunk) use ($buildDirectory, $manifest) {
                            return collect([
                                ...$this->resolvePreloadTagAttributes(
                                    $chunk['src'] ?? null,
                                    $url = $this->assetPath("{$buildDirectory}/{$chunk['file']}"),
                                    $chunk,
                                    $manifest,
                                ),
                                'rel' => 'prefetch',
                                'href' => $url,
                            ])->reject(
                                fn ($value) => in_array($value, [null, false], true)
                            )->mapWithKeys(fn ($value, $key) => [
                                $key = (is_int($key) ? $value : $key) => $value === true ? $key : $value,
                            ])->all();
                        })
                        ->reject(fn ($attributes) => isset($this->preloadedAssets[$attributes['href']])))
                    ->unique('href')
                    ->values()
                    ->pipe(fn ($assets) => with(Js::from($assets), fn ($assets) => match ($this->prefetchStrategy) {
                        'waterfall' => new HtmlString($base.<<<HTML

                            <script>
                                 window.addEventListener('load', () => window.setTimeout(() => {
                                    const linkTemplate = document.createElement('link')
                                    linkTemplate.rel = 'prefetch'

                                    const makeLink = (asset) => {
                                        const link = linkTemplate.cloneNode()

                                        Object.keys(asset).forEach((attribute) => {
                                            link.setAttribute(attribute, asset[attribute])
                                        })

                                        return link
                                    }

                                    const loadNext = (assets, count) => window.setTimeout(() => {
                                        const fragment = new DocumentFragment

                                        while (count > 0) {
                                            const link = makeLink(assets.shift())
                                            fragment.append(link)
                                            count--

                                            if (assets.length) {
                                                link.onload = () => loadNext(assets, 1)
                                                link.error = () => loadNext(assets, 1)
                                            }
                                        }

                                        document.head.append(fragment)
                                    })

                                    loadNext({$assets}, {$this->prefetchChunks})
                                }))
                            </script>
                            HTML),
                        'aggressive' => new HtmlString($base.<<<HTML

                            <script>
                                 window.addEventListener('load', () => window.setTimeout(() => {
                                    const linkTemplate = document.createElement('link')
                                    linkTemplate.rel = 'prefetch'

                                    const makeLink = (asset) => {
                                        const link = linkTemplate.cloneNode()

                                        Object.keys(asset).forEach((attribute) => {
                                            link.setAttribute(attribute, asset[attribute])
                                        })

                                        return link
                                    }

                                    const fragment = new DocumentFragment
                                    {$assets}.forEach((asset) => fragment.append(makeLink(asset)))
                                    document.head.append(fragment)
                                 }))
                            </script>
                            HTML),
                    }));
            }
        });
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        //
    }
}
