'use strict';

import * as fs from "fs";
import * as path from 'path';
import * as net from 'net';
import * as child_process from "child_process";

import { workspace, Disposable, ExtensionContext } from 'vscode';
import { LanguageClient, LanguageClientOptions, SettingMonitor, StreamInfo } from 'vscode-languageclient';

export function activate(context: ExtensionContext) {

	function createServer(): Promise<StreamInfo> {
		return new Promise((resolve, reject) => {
			var server = net.createServer((socket) => {
				console.log("Creating server");

				resolve({
					reader: socket,
					writer: socket
				});

				socket.on('end', () => console.log("Disconnected"));
			}).on('error', (err) => {
				throw err;
			});


			server.listen(() => {
				let options = { cwd: workspace.rootPath };
				let jarPath = workspace.getConfiguration("rubysonar").jarPath;
				console.log(jarPath);

				let args = [
					'-jar',
					jarPath, 
					server.address().port.toString()
				];

        console.log(args);
        console.log(options);
        let process = child_process.spawn('/usr/bin/java', args, options);
        process.stdout.on('data', function (chunk) {
            console.log(chunk.toString());
        });
        process.stderr.on('data', (data) => {
            console.log(data.toString());
        });
			});
		});
	};

	let clientOptions: LanguageClientOptions = {
		documentSelector: [{ scheme: "file", language: "ruby" }],
		synchronize: {
			configurationSection: 'languageServerExample',
			fileEvents: workspace.createFileSystemWatcher("{**/*.rb}")
		}
	}

	let disposable = new LanguageClient('languageServerExample', 'Language Server Example', createServer, clientOptions).start();

	context.subscriptions.push(disposable);
}


exports.activate = activate;

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
