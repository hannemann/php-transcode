<?php

// @formatter:off
// phpcs:ignoreFile
/**
 * A helper file for your Eloquent Models
 * Copy the phpDocs from this file to the correct Model,
 * And remove them from this file, to prevent double declarations.
 *
 * @author Barry vd. Heuvel <barryvdh@gmail.com>
 */


namespace App\Models{
/**
 * @property int $id
 * @property string $path
 * @property array<array-key, mixed> $streams
 * @property string|null $clips
 * @property string $type
 * @property string $state
 * @property int $percentage
 * @property string|null $exception
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property int|null $rate
 * @property int|null $remaining
 * @property string $command
 * @property string $start
 * @property string $end
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CurrentQueue newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CurrentQueue newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CurrentQueue onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CurrentQueue query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CurrentQueue whereClips($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CurrentQueue whereCommand($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CurrentQueue whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CurrentQueue whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CurrentQueue whereEnd($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CurrentQueue whereException($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CurrentQueue whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CurrentQueue wherePath($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CurrentQueue wherePercentage($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CurrentQueue whereRate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CurrentQueue whereRemaining($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CurrentQueue whereStart($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CurrentQueue whereState($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CurrentQueue whereStreams($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CurrentQueue whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CurrentQueue whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CurrentQueue withTrashed(bool $withTrashed = true)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CurrentQueue withoutTrashed()
 */
	class CurrentQueue extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property \Illuminate\Support\Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $remember_token
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Laravel\Sanctum\PersonalAccessToken> $tokens
 * @property-read int|null $tokens_count
 * @method static \Database\Factories\UserFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmailVerifiedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereRememberToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereUpdatedAt($value)
 */
	class User extends \Eloquent {}
}

