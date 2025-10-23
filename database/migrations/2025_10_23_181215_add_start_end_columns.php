<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddStartEndColumns extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('current_queues', function (Blueprint $table) {
            $table->timestamp('start')->default(-1);
            $table->timestamp('end')->default(-1);
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
            $table->dropColumn('start');
        });
        Schema::table('current_queues', function (Blueprint $table) {
            $table->dropColumn('end');
        });
    }
}
