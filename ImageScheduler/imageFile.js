var glob = require("glob")
var Prefix="foo://"
var actualPrefix="file://"

/*function worker(parm)
{
	this.viewerinfo=parm;
}*/

module.exports.listImageFiles = function (ImageItem, viewerinfo) {
	
	return  new Promise((resolve,reject) =>{
		// calculate uri for file(s)
		let url1 = ImageItem.Source.Root + (ImageItem.Image.PathFromSource.startsWith("/")?"":"/")+ ImageItem.Image.PathFromSource
    // if its not a directory
		if(fs.statSync(url1).isDirectory()){
			// if it does NOT have a wildcard)
			if(url1.indexOf("*")<0){
				// add one
				url1+="/*";
			}
		}
		else {
			if(url1.indexOf("*")<0){
					viewerinfo.images.found.push(url1);
					// is this a file or folder? if folder, then make it a glob string and redo
					resolve(viewerinfo);
			}		
		}

		glob(url1, { nocase: true, absolute: true},
		 (err, files) =>{
			// put all the files on the viewers list
				files.forEach((file) => {
					//console.log("adding image for viewer = "+this.b.Viewer.Name+"="+Prefix+file);
					viewerinfo.images.found.push(Prefix+file)
				});
			// let the viewer know we have files
			//console.log(" File handler done with glob list, count="+viewerinfo.images.found.length)
			resolve(viewerinfo) 
		});
	})

}
module.exports.resolver = function ( file) {
	return new Promise((resolve,reject) =>{  
    //console.log("file resolver returning "+actualPrefix+file.substring(Prefix.length)+" for "+file);
    resolve(actualPrefix+file.substring(Prefix.length))
  })
}
module.exports.getPrefix = function () {
	return Prefix;
}
module.exports.listFiles = function(Authinfo,path, FoldersOnly, callback){
	var options= {};
	options.mark=true;
	options.silent=true;
	options.nonull=false;
	options.nocase=true;
	//console.log("in file listFiles, path="+path);
	glob(path,options,
		function(err, Files)
		{
			//console.log("in file listFiles have results, count="+Files.length);
			var requested_filetype="";
			if(err==null)
			{
				let files=[]
				if(path.includes("/.."))
				{
					var i = path.lastIndexOf("/..")
					i = path.lastIndexOf("/",i-1)
					path=path.substring(0,i)
				}
				else
				{
					if(path.indexOf("{")>0)
					{
						// get the braced section into an array
						var braced_elements=path.substring(path.lastIndexOf("{")+1,path.length-1).split(",")
						//console.log("there are "+braced_elements.length+" entries to process");
						for(var e of braced_elements)
						{
							//console.log("checking braced element="+e);
							if(e.indexOf(".")>0)
							{
								requested_filetype=e.substring(e.indexOf(".")+1);
								if (requested_filetype.startsWith("*"))
								{
									requested_filetype=requested_filetype.substring(1).toLowerCase();
								}
								break;
							}
						}
						path=path.substring(0,path.lastIndexOf("{"))
					}
					else
					{
						var work=path.substring(path.lastIndexOf("/")+1)
						if(work.indexOf(".")>0)
						{
							requested_filetype=work.substring(work.indexOf(".")+1);
							if (requested_filetype.startsWith("*"))
							{
								requested_filetype=requested_filetype.substring(1).toLowerCase();
							}
						}
						path=path.substring(0,path.lastIndexOf("/")+1)
					}
					if(requested_filetype!="")
					{
						//console.log("requested filetype="+requested_filetype)
						// leave this line present all the time
					}
				}
				if(!path.endsWith("/"))
				{path+="/";}
				console.log("file path="+path);
				for(let file of Files)
				{
					console.log("in file listFiles processing for, file="+file);
					var entry = {}
					var type=""
					// don't send back the source path entry
					if(file != path+"/"  && file!="." && file !="..")
					{
						// get just the part above the path
						file=file.substring(path.length)
						if(file.endsWith("/"))
						{
							file=file.substring(0,file.length-1)
							type="Folder"
						}
						else
						{
							// if we are requesting files and folders
							if(FoldersOnly=="false")
							{
								type="File"
								// if a specific filetype was requested, and this one isn't of that type
								// skip this file
								if(requested_filetype!="")
								{
									//console.log("checking filetype="+requested_filetype)
									// leave this line present all the time

								}
								console.log("checking filetype="+requested_filetype)
								if(requested_filetype!="" && !file.toLowerCase().endsWith(requested_filetype.toLowerCase()))
								{continue;}
							}
							else
							// folders only, don't return files
							{continue;}
						}

						entry.name=file;
						entry.filetype=type
						console.log("have file entry="+ entry.name+" type="+entry.filetype);
						files.push(entry)
					}
				}
				callback(null,files);

			}
			else
			{
				console.log("glob failed err="+err)
				callback(err,null)

			}
		}
	);
}