/*
 * Copyright (C) 2011 Alasdair Morrison <amorri40@gmail.com>
 *
 * This file is part of the 39js Library.
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either 
 * version 2.1 of the License, or (at your option) any later version.
 * 
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public 
 * License along with this library.  If not, see <http://www.gnu.org/licenses/>.
 */

var app = require('http').createServer(handler), io = require('socket.io')
		.listen(app), fs = require('fs');

io.configure('development', function(){
  io.set('destroy upgrade', false);
});

io.configure('production', function(){
  io.set('destroy upgrade', false);
});

// create the player array
var global = {
	player: []
};

app.listen(8080); // open up tcpsocket

function handler(req, res) {
	fs.readFile(__dirname + '/index.html', function(err, data) {
		if (err) {
			res.writeHead(500);
			return res.end('Error loading index.html');
		}

		res.writeHead(200);
		res.end(data);
	});
}

console.log('server started!');
io.sockets.on('connection', function(socket) { // basically the tcpaccept function
		// we need to send them their official ID
		
		global[socket.id] = socket.connection = socket;
	
		// NOTE - Setting player_id to the last element of the 
		var player_id = global.player.length;
		global.player.push({
			player_id : player_id,
			x : 0,
			y : 0,
			ping : 0,
			tcp : socket
		})
		
		clearbuffer(); //send them their id
		writebyte(1);
		writebyte(player_id);
		sendmessage(socket);
		
		socket.on('ping', function(data) {
			tcp = socket;
			buffer=data;
			pid = readshort();
			ping = readshort();
			//global.player[pid].ping = ping;
			if(ping > 2500){
				clearbuffer();
				writebyte(9);
				writeshort(pid);
				send_all_players();
				global.player.splice(pid, 1);
				// NOTE - Deleting the player like this will make you're index mismatch.
				// IE if you delete player at index 3, the player at index 4 will become player[3] 
				// but its player_id will still be 4. If it disconnects, you will delete player[4] 
				// which is actually player_id 5
			}else{
				clearbuffer();
				writebyte(20);
				writeshort(ping+1);
				sendmessage(tcp);
			}
		});
		
		socket.on('disconnect', function() { 
		if (global.player) {
		for( var i = 0; i < global.player.length; i++){
			var pid = global.player[i].player_id;
			if ( global.player[i].tcp === global[socket.id]) {
				global.player.splice(i, 1);
				clearbuffer();
				writebyte(9);
				writeshort(pid);
				send_all_players();
				console.log('someone disconnected!');
				console.log("Players:" + global.player.length);
				}
			}
		}
		});

		socket.on('message', function(data) {
			
			tcp = socket;
			buffer=data;
			messageid = readbyte();
			
			switch (messageid) {
			case 1:
				// Someone is sending x and y
				pid = readshort();
				playerx = readshort();
				playery = readshort();
				lastdir = readshort();
				//ping = readshort();
				clearbuffer();
				writebyte(2);
				writeshort(pid);
				writeshort(playerx);
				writeshort(playery);
				writeshort(lastdir);
				//writeshort(ping);
				send_all_players();
				//global.player[pid].ping=0;
				break;

			case 2:
				// Someone joined
				pid = readshort();
				playerx = readshort();
				playery = readshort();
				playername = readstring();
				clearbuffer();
				writebyte(3);
				writeshort(pid);
				writeshort(playerx);
				writeshort(playery);
				writestring(playername);
				send_all_players();
				console.log(playername + " has joined!");
				console.log("Players:" + global.player.length);
				break;
/*
			case 3:
				// Someone joined
				pid = readshort();
				playerx = readshort();
				playery = readshort();
				playername = readstring();
				clearbuffer();
				writebyte(3);
				writeshort(pid);
				writeshort(playerx);
				writeshort(playery);
				writestring(playername);
				send_all_players();
				break;
*/
			case 4:
				// Receive old players
				pid = readshort();
				playerx = readshort();
				playery = readshort();
				lastdir = readshort();
				playername = readstring();
				clearbuffer();
				writebyte(4);
				writeshort(pid);
				writeshort(playerx);
				writeshort(playery);
				writeshort(lastdir);
				writestring(playername);
				send_all_players();
				break;

			case 5:
				// Someone is loggin in......
				username = readstring();
				userpass = readstring();
				px = readshort();
				py = readshort();
				/*
				 * if (ini_read_string(username, "password", "") == userpass) {
				 * px = ini_read_real(username, "x", ""); py =
				 * ini_read_real(username, "y", "");
				 */
				if (true) {// for now
					clearbuffer();
					writebyte(5);
					writestring(username);
					writeshort(px);
					writeshort(py);
					sendmessage(tcp);
				} else {
					clearbuffer();
					writebyte(6);

					sendmessage(tcp);
				}

				break;

			case 6:
				// Someone is Registering
				username = readstring();
				userpass = readstring();
				if (false) {// if (ini_section_exists(username)) { //username taken!
					clearbuffer();
					writebyte(7);
					sendmessage(tcp);
				} else {
					//ini_write_string(username, "password", userpass)
					clearbuffer();
					writebyte(8);
					writestring(username);
					writestring(userpass);
					sendmessage(tcp);
				}

				break;

			case 7:
				// Someone is Leaving
				// Save their data
				pid = readshort();
				user = readstring();
				savex = readshort();
				savey = readshort();
				global.player.splice(pid, 1);
					// NOTE - Same issue as above, pid may not equal their index in the player array
				// ini_write_real(user, "x", savex);
				// ini_write_real(user, "y", savey);
				// Now tell everyone they left
				clearbuffer();
				writebyte(9);
				writeshort(pid);
				send_all_players();
				//console.log("players:" + global.player.length);
				break;
				
			case 8:
				//Someone sent a chat message
				thename = readstring();
				message = readstring();
				clearbuffer();
				writebyte(10);
				writestring(thename);
				writestring(message);
				send_all_players();
				console.log(thename + ": " + message);
				break;
			}
		});
		socket.on('newinput', function(data) {
			
			tcp = socket;
			buffer=data;
			messageid = readbyte();
			
			switch (messageid){
			case 9: //Left
				pid = readshort();
				playerx = readshort();
				playery = readshort();
				lastdir = readshort();
				clearbuffer();
				writebyte(11);
				writeshort(pid);
				writeshort(playerx);
				writeshort(playery);
				writeshort(lastdir);
				update_all_players();
				break;
				
			case 10: //Right
				pid = readshort();
				playerx = readshort();
				playery = readshort();
				lastdir = readshort();
				clearbuffer();
				writebyte(12);
				writeshort(pid);
				writeshort(playerx);
				writeshort(playery);
				writeshort(lastdir);
				update_all_players();
				break;
				
			case 11: //Up
				pid = readshort();
				playerx = readshort();
				playery = readshort();
				lastdir = readshort();
				clearbuffer();
				writebyte(13);
				writeshort(pid);
				writeshort(playerx);
				writeshort(playery);
				writeshort(lastdir);
				update_all_players();
				break;
				
			case 12: //Down
				pid = readshort();
				playerx = readshort();
				playery = readshort();
				lastdir = readshort();
				clearbuffer();
				writebyte(14);
				writeshort(pid);
				writeshort(playerx);
				writeshort(playery);
				writeshort(lastdir);
				update_all_players();
				break;
				
			case 13: //LeftReleased
				pid = readshort();
				playerx = readshort();
				playery = readshort();
				lastdir = readshort();
				clearbuffer();
				writebyte(15);
				writeshort(pid);
				writeshort(playerx);
				writeshort(playery);
				writeshort(lastdir);
				update_all_players();
				break;
				
			case 14: //RightReleased
				pid = readshort();
				playerx = readshort();
				playery = readshort();
				lastdir = readshort();
				clearbuffer();
				writebyte(16);
				writeshort(pid);
				writeshort(playerx);
				writeshort(playery);
				writeshort(lastdir);
				update_all_players();
				break;
				
			case 15: //UpReleased
				pid = readshort();
				playerx = readshort();
				playery = readshort();
				lastdir = readshort();
				clearbuffer();
				writebyte(17);
				writeshort(pid);
				writeshort(playerx);
				writeshort(playery);
				writeshort(lastdir);
				update_all_players();
				break;
				
			case 16: //DownReleased
				pid = readshort();
				playerx = readshort();
				playery = readshort();
				lastdir = readshort();
				clearbuffer();
				writebyte(18);
				writeshort(pid);
				writeshort(playerx);
				writeshort(playery);
				writeshort(lastdir);
				update_all_players();
				break;
			}
		});
	});
/*if (global.player) {
	for ( var i=0; i < global.player.length; i++){
		if(global.player[i].ping < 50)
		{
			global.player[i].ping++;	
		}
		else{
			clearbuffer();
			writebyte(9);
			writeshort(global.player[i].player_id);
			send_all_players();
		}
	}
}*/

send_all_players=function() {
for (var player in global.player) {
	if (player) {
	sendmessage(global.player[player].tcp);
	}
	}		
}
update_all_players=function() {
for (var player in global.player) {
	if (player) {
	sendinput(global.player[player].tcp);
	}
	}		
}

/*
 * The 39js wrapper functions
 */
var buffer = [];
var messages = [];

dllinit = function() {
} // no init require atm
tcpconnect = function(serverip, serverport) {
	var sock = gmsocketio_connect(serverip + ":" + serverport);
	gmsocketio_recieve_callback(sock, "message", callback_39js);
	gmsocketio_recieve_callback(sock, "newinput", callback_39js);
	return sock;
}
clearbuffer = function() {
	buffer = [];
}
writeshort = writebyte = writestring = function(value) {
	buffer.push(value);
}

sendmessage = function(sock) {
	/*gmsocketio_send(sock, buffer);*/
	//server version
	sock.emit("message", buffer);
}
sendinput = function(sock) {
	/*gmsocketio_send(sock, buffer);*/
	//server version
	sock.emit("newinput", buffer);
}
receivemessage = function(sock) {
	if (messages.length < 1)
		return 0;
	buffer = messages.pop();
	return buffer.length;
}

readshort = readstring = readbyte = function() {
	return buffer.shift();
}

callback_39js = function(data) {
	messages.push(data);
}

/*
 * The socketio functions
 */
var sockets = [];

var callbacks = {}

gmsocketio_connect = function(host) {
	sockets.push(io.connect(host));
	return sockets.length - 1;
}

gmsocketio_recieve_callback = function(id, event, callback) {
	if (!sockets[id])
		return;
	sockets[id].on(event, callback);
}

gmsocketio_recieve_script = function(id, event, scriptid) {
	if (!sockets[id])
		return;
	if (!callbacks[event])
		callbacks[event] = [];
	callbacks[event].push(scriptid);
	sockets[id].on(event, gmsocketio_actual_callback);
}

gmsocketio_recieve_once = function(id, event, callback) {
	if (!sockets[id])
		return;
	sockets[id].once(event,callback);
}

gmsocketio_send = function(id, message) {
	if (!sockets[id])
		return;
	sockets[id].emit("message", message);

}

gmsocketio_disconnect = function(id) {
	if (!sockets[id])
		return;
	sockets[id].disconnect();
	delete sockets[id];
}

gmsocketio_actual_callback = function(data) {
	gml_Script_gmsocketio_callback(data);
}
