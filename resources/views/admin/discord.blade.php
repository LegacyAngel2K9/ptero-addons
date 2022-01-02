@extends('layouts.admin')

@section('title')
    Discord Settings
@endsection

@section('content-header')
    <h1>Discord Settings <small>Set your discord app details.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Discord Settings</li>
    </ol>
@endsection

@section('content')
    <div class="row">
        <div class="col-xs-12">
            <div class="box box-primary">
                <div class="box-header">
                    <h3 class="box-title">Discord Settings</h3>
                </div>
                <form method="post" action="{{ route('admin.discord.save') }}">
                    <div class="box-body">
                        <div class="row">
                            <div class="form-group col-xs-12 col-lg-6">
                                <label for="clientId">Client ID</label>
                                <input type="text" class="form-control" name="clientId" id="clientId" value="{{ old('clientId', $clientId) }}" placeholder="Enter your discord app client id">
                            </div>
                            <div class="form-group col-xs-12 col-lg-6">
                                <label for="clientSecret">Client Secret</label>
                                <input type="text" class="form-control" name="clientSecret" id="clientSecret" value="{{ old('clientSecret', $secret) }}" placeholder="Enter your discord app client secret">
                            </div>
                            <div class="col-xs-12">
                                Your redirect url is: <code>{{ route('index') }}/account</code> Please set it in discord app settings.
                            </div>
                        </div>
                        <hr>
                        <div class="row">
                            <div class="form-group col-xs-12 col-lg-6">
                                <label for="botUrl">Bot URL</label>
                                <input type="text" class="form-control" name="botUrl" id="botUrl" value="{{ old('botUrl', $botUrl) }}" placeholder="Enter your discord bot url: ip:8080">
                            </div>
                            <div class="form-group col-xs-12 col-lg-6">
                                <label for="panelToken">Panel Token</label>
                                <input type="text" class="form-control" disabled id="panelToken" value="{{ $panelToken }}">
                                <small>Copy this token to your discord bot config file.</small>
                            </div>
                            <div class="form-group col-xs-12">
                                <label for="guildId">Guild ID</label>
                                <input type="text" class="form-control" name="guildId" id="guildId" value="{{ old('guildId', $guildId) }}" placeholder="Enter your server id">
                            </div>
                            <div class="form-group col-xs-12 col-lg-6">
                                <label for="roleId">Has Server Role ID</label>
                                <input type="text" class="form-control" name="roleId" id="roleId" value="{{ old('roleId', $roleId) }}" placeholder="Enter client role id">
                            </div>
                            <div class="form-group col-xs-12 col-lg-6">
                                <label for="exRoleId">Not Has Server Role ID</label>
                                <input type="text" class="form-control" name="exRoleId" id="exRoleId" value="{{ old('exRoleId', $exRoleId) }}" placeholder="Enter client role id - if you don't want to use, leave empty">
                            </div>
                        </div>
                    </div>
                    <div class="box-footer">
                        {!! csrf_field() !!}
                        <button type="submit" class="btn btn-success pull-right">Save</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
@endsection
