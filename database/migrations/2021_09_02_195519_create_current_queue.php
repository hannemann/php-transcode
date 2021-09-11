<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCurrentQueue extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('current_queues', function (Blueprint $table) {
            $table->id();
            $table->longText('path');
            $table->string('streams');
            $table->longText('clips')->nullable()->default(null);
            $table->string('type');
            $table->string('state');
            $table->integer('percentage');
            $table->longText('exception')->nullable()->default(null);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('current_queues');
    }
}
