<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Mail\Markdown;

class ChatMessage extends Model
{
    protected $appends = ['html'];

    protected $hidden = ['content', 'updated_at'];

    protected $guarded = [];

    use HasFactory;

    public function html(): Attribute
    {
        return Attribute::get(
            fn ($value, $attributes) => Markdown::converter()->convert($attributes['content'])->getContent()
        );
    }
}