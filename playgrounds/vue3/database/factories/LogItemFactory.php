<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\LogItem>
 */
class LogItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'level' => $this->faker->randomElement(['info', 'warning', 'error']),
            'message' => $this->faker->sentence(),
            'created_at' => $this->faker->dateTime(),
        ];
    }
}
