function FileStorage(){

	var that  = {};
    var debug = false;
    var isDevice = typeof(device) != "undefined";
    var isready = false;
    var initFunc = undefined;
    var fileTransfer = isDevice ? new FileTransfer() : {};

    that.fileSystem;
    that.files = {};
	that.fileEntries = {};
    that.textForFile = {};

    that.onready = function(func){
        if(isready){
            if(debug) console.log("execute func");
            func();
        }
        else{
        if(debug) console.log("set initFunc");
            initFunc = func;
        }
    };


	that.ReadFile = function(file, callback){

        if(isDevice == false) {
            callback(localStorage[file]);
            return;
        }

        if(that.fileEntries[file] == undefined){

            if(that.fileSystem == undefined){
                if(debug) console.log("no filesystem yet, init your app using the callback function in the constructor of FileStorage");
                return;
            }

            that.fileSystem.root.getFile(file, {create: true, exclusive: false}, function(fileEntry){
                that.fileEntries[fileEntry.name] = fileEntry;
                that.Read(fileEntry.name, callback);
            }, function(error){
                callback(undefined);
            });

        }
        else{
            that.Read(file, callback);
        }
	}

    that.Read = function(file, callback){
        var reader = new FileReader();
        reader.onloadend = function(evt) {
            if(evt.target.result == "") callback(undefined);
            else callback(evt.target.result);
        };

        reader.readAsText(that.fileEntries[file]);
    }


	that.WriteFile = function(file, text, callback){

        if(text == "" || text == undefined){
            if(debug) console.log("WriteFile called without text to write");
            return;
        }

        if(isDevice == false) {
            localStorage[file] = text;
            return;
        }

		that.textForFile[file] = text;

        if(that.fileEntries[file] == undefined){
            that.fileSystem.root.getFile(file, {create: true, exclusive: false}, function(fileEntry){
                    that.fileEntries[fileEntry.name] = fileEntry;
                    that.fileEntries[fileEntry.name].createWriter(function(writer){
                        that.gotFileWriter(writer, callback);
                    }, that.fail);
                }, that.fail);
        }
        else{
            that.fileEntries[file].createWriter(function(writer){
                 that.gotFileWriter(writer, callback);
            }, that.fail);
        }
	}

    that.DeleteFile = function(file){

        if(that.fileEntries[file] != undefined){
            that.fileEntries[file].remove();
            that.fileEntries[file] = undefined;
        }
        else{

            if(that.fileSystem != undefined){
                that.fileSystem.root.getFile(file, {create: true, exclusive: false},
                    function(entry){
                        entry.remove();
                    }, that.fail);    
            }
        }
    }

    that.DeleteDirectoryRecursive = function(name){
        
        that.fileSystem.root.getDirectory(name, { create: false }, function(entry){
            entry.removeRecursively(function(){
                if(debug) console.log("directory deleted");
            }, function(){
                if(debug) console.log("error removeRecursively");
            });
        }, function(){
            if(debug) console.log("error deleting directory");
        });
    }

    that.entriestoremove;
    that.removetotal;
    that.lastcount = 0;
    that.removecounter = 0;
    that.updateFunc;
    that.finishFunc;


    that.removeEntry = function(){
        that.entriestodelete[that.removecounter].remove(function(){
            that.removecounter++;
            var perc =  Math.round(50 - (( that.removecounter / that.removetotal) * 50));
            that.updateFunc(perc);
        },null);

    }

    that.checkdeleted = function(){

        if(that.removecounter == that.removetotal){
            that.finishFunc();
            return;            
        }

        if(that.removecounter > that.lastcount){
            that.lastcount = that.removecounter;
            that.removeEntry(that.removecounter);
        }
        setTimeout(that.checkdeleted, 10);
    }



    that.DeleteDirectory = function(name, updateFunc, finishFunc){

        if(updateFunc == undefined) return  that.DeleteDirectoryRecursive(name);

        that.removecounter = 0;
        that.lastcount = 0;
        that.updateFunc = updateFunc;
        that.finishFunc = finishFunc;
        
        that.fileSystem.root.getDirectory(name, { create: false }, function(entry){
            
            var directoryReader = entry.createReader();

            directoryReader.readEntries(function(entries){

                that.entriestodelete = entries;
                that.removetotal = entries.length;

                if(that.removetotal == 0){
                    that.finishFunc();
                    return;
                }

                that.removeEntry(0);

                //start checking
                that.checkdeleted();


            },function(){
                //error read entries
                if(debug) console.log("error read entries" );
                that.finishFunc();
            });

        }, function(){
            //error get dir
            if(debug) console.log("error get dir" );
            that.finishFunc();
        });
    }

    that.gotFS = function(fileSystem) {
        if(debug) console.log("got filesystem");

        that.fileSystem  = fileSystem;
        isready = true;
        if(initFunc != undefined) initFunc();
 
        if(debug){
            console.log("fileSystem ready");
            console.log(fileSystem.root.fullPath);
        }
           
    }

    that.gotFileWriter = function(writer, callback) { 
        var file = that.getName( writer.fileName );
        if(debug) console.log("write to file: " + file);

        writer.onwriteend = function(evt) {
            if(debug) console.log("file written..");
            if(callback != undefined) callback();
        };
        writer.write(that.textForFile[file]);
    }

	that.fail = function(error) {
        if(debug) console.log("FileStorage Error Code: " + error.code);
    }

    that.getName = function(fullName){
        var splitted = fullName.split("/");
        return splitted[ splitted.length -1 ];
    }


    that.FileExist = function(path, ifNotExist, ifExist){
        that.fileSystem.root.getFile(path, { create: false }, function(){
            ifExist();
        }, function(){
            ifNotExist();
        });
    }


    that.DownloadImage = function(url, localfile, onsuccess){
        var uri = encodeURI(url);
        fileTransfer.download(uri, localfile, function(entry) {
                onsuccess();
            },
            function(error) {

                if(debug) {
                    console.log("download error source " + error.source);
                    console.log("download error target " + error.target);
                    console.log("upload error code" + error.code);
                }
            }
        );
    }

    if(debug) console.log("FileStorage going to request filesystem");

   	if(isDevice) window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, that.gotFS, that.fail);

	return that;
}