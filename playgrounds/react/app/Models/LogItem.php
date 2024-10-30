<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LogItem extends Model
{
    use HasFactory;

    protected $fillable = ['level', 'message'];
}
