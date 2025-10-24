<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChatMessage extends Model
{
    protected $hidden = ['updated_at'];

    protected $guarded = [];

    use HasFactory;
}
