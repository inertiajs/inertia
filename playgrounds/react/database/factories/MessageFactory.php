<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Lottery;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Message>
 */
class MessageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'from' => Lottery::odds(1, 2)->choose() ? 'Jonathan' : 'Joe',
            'body' => $this->faker->sentence(),
            'created_at' => $this->faker->dateTime(),
        ];
    }
}
