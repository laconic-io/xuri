/*!
 * xuri v0.0.0
 * http://laconic.io/parsURI
 *
 * Copyright 2014 laconic.io
 * Released under MIT license
 *
*/
function xuri(uri, scheme){
	
	/***
	** step 0: predefine variables & recurring functions
	*/
	// u is return object + copy full uri
	var u = {uri:uri};
	// parse query strings
	function parseQuery(str, eq, spl){
		var q = {};
		var vars = str.split(spl);
		for(var i = 0; i < vars.length; ++i){
			var eqSep = vars[i].indexOf(eq);
			if(eqSep > 0)
				q[vars[i].substring(0,eqSep)] = decodeURIComponent(vars[i].substring(eqSep + 1));
		}
		return q;
	}
	// parse host into hostname and port and type
	function parseHost(host){
		var ret = [];
		// seperate port
		var portSep = host.indexOf(':');
		if(portSep > -1){
			ret.port = host.substring(portSep+1);
			host = host.substring(0, portSep);
		}
		// domain type
		if(auth.substring(0,1) === '['){
			// if ipv6
			ret.hostformat = 'ipv6';
			ret.hostname = host.substring(1, host.indexOf(']'));
		}else if(host.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/)){
			// if ipv4
			ret.hostformat = 'ipv4';
			ret.hostname = host;
		}else{
			// domain
			ret.hostformat = 'domain';
			ret.hostname   = host;
			ret.domains	   = ret.hostname.split('.').reverse();
			if(ret.domains > 1)
				ret.site   = ret.domains[0]+'.'+ret.domains[1];
		}
		return ret;
	}
	// remove empty values from array
	function cleanEmpties(a){
		var ra = [];
		for(var i = 0; i < a.length; i++)
			if(a[i])
				ra.push(a[i]);
		return ra;
	}
	
	/***
	** step 1: parse universal components (RFC 3986)
	** <scheme> : <heirarchical> [? <query> ] [# <fragment>]
	*/
	// get scheme and remove
	if(uri.match(/^[a-z][a-z0-9\.\+\-]+\:/i)){
		u.scheme = uri.substring(0, uri.indexOf(':')).toLowerCase();
		uri		 = uri.substring(u.scheme.length + 1);	
	}else if(typeof scheme !== 'undefined'){
		
	}
	// get fragment and remove
	var hashSep	= uri.indexOf('#');
	if(hashSep > -1){
		u.fragment	= uri.substring(hashSep + 1);
		uri			= uri.substring(0, hashSep);
	}
	// get query and remove
	var querySep = uri.indexOf('?');
	if(querySep > -1){
		u.query		= uri.substring(querySep + 1);
		uri			= uri.substring(0, querySep);
	}
	// remaining uri is hierarchical
	u.hierarchical	= uri;

	
		
	/***
	** step 2: chop up information by scheme
	** attempted to section by functionality
	**
	*/
	
	// mailto:<address>?[&params=val&var=...]
	if('mailto' === u.scheme){
		u.addresses	= cleanEmpties(u.hierarchical.split(','));
		u.params	= parseQuery(u.query, '=', '&');
	}else

	// tel|fax|modem:<phonenumber> (fax & modem are historical)
	if(['tel','fax', 'modem'].indexOf(u.scheme) > -1){
		u.phonenumber = u.hierarchical;
	}else

	// sms:<phonenumbers>[&params=val&var=...]
	if('sms' === u.scheme){
		u.phonenumber = cleanEmpties(u.hierarchical.split(','));
		if(u.query)
			u.params = parseQuery(u.query, '=', '&');
	}else
	
	// geo://<lat,<lon>[,<alt>][;crs=<coordinateReferenceSystem>][;u=<uncertainty>]
	if(u.scheme === 'geo'){
		// crs & u vars exist 
		var sep = u.hierarchical.indexOf(';');
		if(sep > -1){
			u.location = u.hierarchical.substring(0, sep);
			u.params   = u.hierarchical.substring(sep + 1);
		}else{
			u.location = u.hierarchical;
		}
		// location
		var locSpl = u.location.split(',');
		u.latitude = locSpl[0];
		u.logitude = locSpl[1];
		if(locSpl[2]){
			u.altitude = locSpl[2];
		}
		// params
		if(u.params){
			var pr = parseQuery(u.params, '=', ';');
			if(pr.crs)
				u.crs = pr.crs;
			if(pr.u)
				u.u = pr.u;
		}
	}else

	// maps:q=<query location>
	if('maps' === u.scheme){
		u.location  = decodeURIComponent(u.hierarchical.substring(2));
		u.q			= u.location;
	}else

	// file:(//[host]/path | [//host]/path)
	if('file' === u.scheme){
		// host exist
		if(u.hierarchical.substring(0,2) == '//'){
			var pathSep = u.hierarchical.indexOf('/', 2);
			u.host = u.hierarchical.substring(2, pathSep);
			u.path = u.hierarchical.substring(pathSep);
		}else{
			u.host = '';
			u.path = u.hierarchical;
		}
	}else
	
	// ssh://[<user>[;fingerprint=<host-key fingerprint>]@]<host>[:<port>]
	if('ssh' === u.scheme){
		// parse user info
		var userSep = u.hierarchical.indexOf('@');
		if(userSep > -1){
			var tuser = u.hierarchical.substring(0, userSep);
			var fingSep = tuser.indexOf(';');
			if(fingSep > 0){
				u.user	 	  = tuser.substring(0, fingSep);
				u.fingerprint = tuser.substring(fingSep + 13);
				u.params = parseQuery(tuser.substring(fingSep + 1, '=', ';'));
			}else{
				u.user = tuser;
			}
		}else{
			u.host = u.hierarchical;
		}
		// parse host
		var thost = parseHost(u.host);
		u.hostname	 = thost.hostname;
		u.hostformat = thost.hostformat;
		if(thost.port)
			u.port 	 = thost.port;
	}else
	
	// dns:[//<hostname>[:<port>]/]<dnsname>[?<dnsquery>]
	if('dns' === u.scheme){
		// host 
		if(u.hierarchical.substring(0,2) === '//'){
			var pathSep = u.hierarchical.indexOf('/', 2);
			u.host = u.hierarchical.substring(2, pathSep);
			var thost = parseHost(u.host);
			u.hostname	 = thost.hostname;
			u.hostformat = thost.hostformat;
			if(thost.port)
				u.port 	 = thost.port;
		}else{
			u.path = u.hierarchical;
		}
		u.params = parseQuery(u.query, '=', ';');
	}else
	
	// general syntax (also catch all)
	// http|https|ftp|ftps|nfs|*//[user:password@hostname[:port][/path][?query][#fragment]
	if(['http','https','ws','wss','ftp', 'ftps', 'nfs']){
		// parse "authority" if exists
		if(u.hierarchical.substr(0,2) === '//'){
			// parse "path" (if path exists)
			var pathSep	= u.hierarchical.indexOf('/', 2);
			if(pathSep > -1){
				u.authority = u.hierarchical.substring(2, pathSep);
				u.path		= u.hierarchical.substring(pathSep);
			}else{
				u.authority = u.hierarchical;
			}
			// copy authority to chop up
			var auth = u.authority;
			// parse "user" & "password" if exists
			var userinfoSep	= auth.indexOf('@');
			if(userinfoSep > -1){
				// userinfo present
				u.userinfo	= auth.substring(0, userinfoSep);
				// seperate user & password
				var userpswdSep = u.userinfo.indexOf(':');
				u.user 			= u.userinfo.substring(0, userpswdSep);
				u.password		= u.userinfo.substring(userpswdSep + 1);
				// remove userinfo from temp authority string
				auth = auth.substring(userinfoSep + 1);	
			}
			// parse "host"
			u.host 		 = auth;
			var thost 	 = parseHost(u.host);
			u.hostname   = thost.hostname;
			u.hostformat = thost.hostformat;
			if(thost.port)
				u.port 	  = thost.port;
			if(thost.domains)
				u.domains = thost.domains;
			if(thost.site)
				u.site	  = thost.site;
		}else{
			// no authority section, hierarchical = path
			u.path = u.hierarchical;
		}
		// parse "params"
		u.params = parseQuery(u.query, '=', /\&|\;/);
	}
	
	/***
	** return u object
	*/
	return u;
}



