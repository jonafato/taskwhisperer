const Gio   = imports.gi.Gio;
const GLib  = imports.gi.GLib;
const Lang  = imports.lang;

const SpawnReader = function () { };

SpawnReader.prototype.spawn = function (path, command, func, finishedFunc) {

    let pid, stdin, stdout, stderr, stream, reader;

    [res, pid, stdin, stdout, stderr] = GLib.spawn_async_with_pipes(
        path, command, null, GLib.SpawnFlags.SEARCH_PATH, null);

    stream = new Gio.DataInputStream({ base_stream : new Gio.UnixInputStream({ fd : stdout }) });

    this.read(stream, func, finishedFunc);
};

SpawnReader.prototype.read = function (stream, func, finishedFunc) {

    stream.read_line_async(GLib.PRIORITY_LOW, null, Lang.bind (this, function (source, res) {

        let out, length;

        [out, length] = source.read_line_finish(res);
        if (out !== null) {
            func(out);
            this.read(source, func, finishedFunc);
        }else{
            finishedFunc();
        }
    }));
};
