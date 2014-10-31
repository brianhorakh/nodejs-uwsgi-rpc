
var net = require('net');

/*
Special thanks to unbit, code ideas borrowed from:
	* https://github.com/unbit/perl-net-uwsgi/blob/master/lib/Net/uwsgi.pm
	* https://github.com/unbit/uwsgi-node-rpc-server/blob/master/uwsgi_rpcserver.js
*/


function uwsgi_rpc(addr) {
	this.serveraddr = addr;
	if (false == (this instanceof uwsgi_rpc)) {
		return new uwsgi_rpc;
		}
	}
module.exports = uwsgi_rpc;

uwsgi_rpc.prototype.test = function() { console.log('hello' + this.serveraddr); }

uwsgi_rpc.prototype.serveraddr = function(addr) {
	this.serveraddr = addr;
	};

uwsgi_rpc.prototype.call = function(args) {
	// console.log('args: '+args.join('|'));
	var res = this.u_send_request(this.uwsgi_pkt(173,0,args));
	console.log('res'+res);
	return(res);
	}

uwsgi_rpc.prototype.uwsgi_pkt = function(modifier1,modifier2) {
		// note: this does not support arguments of type array
		var args = Array.prototype.slice.call(arguments, 2)[0];
		var parts = new Array;	
		for (var i = 0; i<args.length; i++) {
			var str = args[i].toString("utf8");
			var itembuf = new Buffer( 2 + Buffer.byteLength(str,"utf8") );		 
			itembuf.writeUInt16LE( Buffer.byteLength(str,"utf8"), 0);
			itembuf.write( str, 2, "utf8");
			parts.push(itembuf);
			}

		var body = Buffer.concat(parts);
		var header = new Buffer(4);
		header.fill(0,0,4);
		header.writeUInt8(modifier1, 0);	
		header.writeUInt16LE( body.length , 1);	
		header.writeUInt8(modifier2, 3);	
		parts.unshift(header);
	
		var r = Buffer.concat(parts);
		// console.log("json:%j",r.toString("hex"));
		return( r );
		}


/*	
PERL

sub u_send_request {
my ($addr, $pkt) = @_;
my $socket = undef;
if ($addr =~ /:/) {
$socket = IO::Socket::INET->new(PeerAddr => $addr);
}	
else {
$socket = IO::Socket::UNIX->new(Peer => $addr);
}
$socket->send($pkt);
return $socket;
}
*/

uwsgi_rpc.prototype.u_send_request = function(pkt) {

	var addr = this.serveraddr;
	var client = new net.Socket();
	var args = new Array();
	
		client.on('data',function(data) {
		   // console.log('DATA ' + client.remoteAddress + ': ' + data);
			if (data.length >= 0) {
				var pktsize = data.readUInt16LE(0);
				// here we parse the uwsgi rpc response
				for(var i=0;i<pktsize;i++) {
					item_len = data.readUInt16LE(4 + i);
					var base = 4 + i + 2;
					var item = data.toString('utf8', base, base + item_len);
					args.push(item);
					i += 1 + item_len;
					}
				// check if the functions is defined
				if (args.length == 0) return -1;
				}
			console.log("return args ---> %j", args); 
			return(data);
			});

		client.on('end',function() {
			console.log("end args ---> %j",args);
			return(args.join("").toString("utf8"));
			});

		client.on('connection',function() {
			console.log("connection");
			});

		client.on('close',function() {
			console.log("close");
			});

		client.connect('7000','127.0.0.1',function() {
			console.log('CONNECTED');
			client.write(pkt);
			console.log('SEND');
			});

//		var res = u_consume_response(socket);
//		socket.write(buf, 'utf8', function() { socket.destroy();});
		}
	
uwsgi_rpc.prototype.dump = function(data) {
	console.log('dump: '+data);
	}
	
	/*
	sub u_consume_response {
	my ($socket) = @_;
	my $res = '';
	my $sel = IO::Select->new($socket);
	while(1) { unless($sel->can_read) { die "Error: can't select() the uwsgi socket: $!"; } $socket->recv(my $buf, 4096); last unless $buf; $res.=$buf; }
	return $res; 
	}
	*/




