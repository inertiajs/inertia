<?php

namespace Tests\Feature;

use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_the_home_page_uses_the_angular_manifest_name(): void
    {
        $this->get('/')
            ->assertSuccessful()
            ->assertInertia(fn (Assert $page) => $page->component('Home'));
    }

    public function test_the_users_example_exposes_page_props(): void
    {
        $this->get('/users')
            ->assertSuccessful()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Users')
                ->has('users', 12));
    }

    public function test_the_form_example_validates_requests(): void
    {
        $this->from('/form')->post('/form', [])->assertRedirect('/form')->assertSessionHasErrors('name');
    }

    public function test_the_infinite_scroll_example_returns_a_page(): void
    {
        $this->get('/infinite-scroll')
            ->assertSuccessful()
            ->assertInertia(fn (Assert $page) => $page
                ->component('InfiniteScroll')
                ->has('users.data', 15));
    }
}
