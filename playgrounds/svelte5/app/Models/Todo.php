<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Todo extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'done' => 'boolean',
        ];
    }
}
