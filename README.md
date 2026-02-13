## PHP Transcode Toolbox (doc incomplete)

## Create frame perfect cuts out of your DVB Recordings

Cutting DVB recordings with FFMPEG can be a hazzle since you have to take several things in mind.

- If the movie is 4:3 and the commercials are 16:9 the encode fails as soon as the resolution changes
- The same applies to changes in audio streams

To circumvent these flaws in the video stream one would have to create several complicated FFMpeg commands.\
This program tries to mitigate that by providing a browser based gui for FFMpeg.\
The heavy lifting can be done on the server utilizing hardware acceleration by VAAPI (Tested with INTEL and AMD integrated GPU).

## Features

- Frame perfect h264 cutting using the concat filter
- Transcode
    - h264_vaapi
    - hevc_vaapi
    - h264_nvenc
    - hevc_nvenc
    - aac
    - ac3
    - flac
    - copy
    - cvb_subtitle
    - dvd_subtitle
    - Stream selection
    - Aspect ratio selection
- Clipper GUI
- Cropper Gui
- GUI for DeLogo Filter
- GUI for RemoveLogo Filter
- GUI for Fillborders Filter
- Deinterlace
- Scale
- Remux
- Experimental HLS Player (for checking the result only. no fancy features provided)

## Installation using docker (recommended)

Since the project is based on the PHP framework laravel you can simply utilize laravel sail

1. git clone
2. cp .env.example .env # adjust settings
3. ./run

## Hooks

- run.d/pre-start
    - use it to e.g. mount the recordings directory from your server. Have a look at run.d/pre-start.example

## Configuration

Please have a look into .env.example

## Usage:

Point your Browser to <http://127.0.0.1:8078> or <http://HOST:8078>

## Clipper

Search your recording frame by frame for unwanted material.\
If chapter markers are present in the video file these are shown in the timeline.\
These are removed by default from the output file but in the folder of the recording a chapter file is created.\
For chapter file autoloading in Celluloid one can use [chapter-make-read.lua](https://github.com/dyphire/mpv-scripts/blob/main/chapter-make-read.lua) from [dyphire/mpv-scipts](https://github.com/dyphire/mpv-scripts)

## Usage:

- coarse search using mouse or keyboard:
    - Click on Thumbnail bar
    - skip one minute forward: Arrow up
    - skip one minute backward: Arrow Down
    - skip five minutes forward: Shift + Arrow up
    - skip five minutes backward: Shift + Arrow Down
    - skip ten minutes forward: CTRL + Arrow up
    - skip ten minutes backward: CTRL + Arrow Down
- fine search using keyboard:
    - next frame: Arrow right
    - previous frame: Arrow left
    - 2 seconds forward: Shift + Arrow right
    - 2 seconds backward: Shift + Arrow left
    - 5 seconds forward: Shift + Arrow right
    - 5 seconds forward: Shift + Arrow left
- Set marker: +
- remove marker: -
- Move Marker (only if indicator is on clip border or ):
    - Alt + Arrow left/right/up/down (works als with step modifiers)
- Skip to next clip (only if indicator is on clip border):
    - CTRL + Shift + Arrow left/right

## Transcoding

1. Concat if case of multiple files
2. Configure desired filters
3. Transcode

## Troubleshooting

- The user of the php process has to have rw access to the render device
- If its the case that the Resolution changes in the Input than you should trim the Video first.
- In case of green artifacts transcode with lossless audio and best video quality possible first, then transcode again

### Message:

Scale or transcode aborts with error like:

```plaintext
Impossible to convert between the formats supported by the filter 'Parsed_scale_vaapi_0' and the filter 'auto_scaler_0'
Error reinitializing filters!
Failed to inject frame into filter network: Function not implemented
Error while processing the decoded data for stream #0:0
```

#### Possible cause:

- Main movie with aspect ratio of 16:9 is surrounded by 4:3 frames
- Vice versa (Letterboxed)

#### Mitigate

- trim of pre- and post recording padding, scale to display aspect ratio if movie is 4:3 and commercials 16:9
    - Concat
    - Scale to desired aspect ratio
    - Use Clipper to find parts to be skipped
    - Perform final transcode

#### Possible cause:

- Corrupt frames

#### Mitigate:

- Scale

## Installation on Ubuntu 20.04

- PHP 8.3, php-sqlite3
- FFMpeg
- Nginx
- git clone
- cp .env.example .env # adjust settings
- touch database/database.sqlite
- chown www-data database.sqlite

## Systemd (non docker installation, not recommended)

### Laravel Websockets

```plaintext
[Unit]
Description=Runs and keeps alive the PHP Transcode artisan websocket

[Service]
Restart=always
WorkingDirectory=/var/www/php-transcode
ExecStart=/usr/bin/php artisan reverb:start --port=8079
User=1000
Group=1000

[Install]
WantedBy=default.target
```

### Laravel Queue worker

```plaintext
[Unit]
Description=Runs and keeps alive the PHP Transcoder artisan queue:work process

[Service]
Restart=always
WorkingDirectory=/var/www/php-transcode
ExecStart=/usr/bin/php artisan queue:work --queue=default,ffmpeg
User=1000
Group=1000

[Install]
WantedBy=default.target
```

### Laravel Player Queue worker

```plaintext
[Unit]
Description=Runs and keeps alive the PHP Transcoder artisan queue:work process for the player

[Service]
Restart=always
WorkingDirectory=/var/www/php-transcode
ExecStart=/usr/bin/php artisan queue:work --queue=player
User=1000
Group=1000

[Install]
WantedBy=default.target
```

Note that you have to choose user and group with access to recordings and GPU.

## TODO:

- Inotify?

## Fix

## Resources

- <https://github.com/video-dev/hls.js/blob/master/docs/API.md>
- <https://ffmpeg.org/ffmpeg-all.html>
- <https://github.com/protonemedia/laravel-ffmpeg>
- <https://trac.ffmpeg.org/wiki/Concatenate>
- <https://materialdesignicons.com/>

## Dev

Start container:

```plaintext
vendor/bin/sail up -d
```

Run assets watcher:

```plaintext
vendor/bin/sail npm run watch
```

Stop container:

```plaintext
vendor/bin/sail down
```

Xdebug:

- change environment variable `SAIL_XDEBUG_MODE` from `off` to `develop,debug` and restart container for step debugging.

After applying changes to the queue restart it

```plaintext
make restart-queue
```
