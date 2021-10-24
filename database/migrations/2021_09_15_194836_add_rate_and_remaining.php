<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddRateAndRemaining extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('current_queues', function (Blueprint $table) {
            $table->integer('rate')->default('null')->nullable();
            $table->integer('remaining')->default('null')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('current_queues', function (Blueprint $table) {
            $table->dropColumn('rate');
            $table->dropColumn('remaining');
        });
    }
}
