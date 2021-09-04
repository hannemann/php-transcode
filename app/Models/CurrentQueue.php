<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CurrentQueue extends Model
{
    use HasFactory, SoftDeletes;

    const STATE_PENDING = 'pending';
    const STATE_RUNNING = 'running';
    const STATE_DONE = 'done';
    const STATE_FAILED = 'failed';

    protected $fillable = [
        'path',
        'streams',
        'clip_start',
        'clip_end',
        'type',
        'state',
        'percentage',
    ];

    protected $casts = [
        'streams' => 'array',
    ];
}
