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


			// grab a random port.
			server.listen(() => {
				// Start the child java process
				let options = { cwd: workspace.rootPath };

				let args = [
					'-jar',
				  '/Users/frontier/rubysonar/target/rubysonar-0.1-SNAPSHOT-jar-with-dependencies.jar',
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

	// Options to control the language client
	let clientOptions: LanguageClientOptions = {
		// Register the server for plain text documents
		documentSelector: [{ scheme: "file", language: "ruby" }],
		synchronize: {
			// Synchronize the setting section 'languageServerExample' to the server
			configurationSection: 'languageServerExample',
			// Notify the server about file changes to '.clientrc files contain in the workspace
			fileEvents: workspace.createFileSystemWatcher("{**/*.rb}")
		}
	}

	// Create the language client and start the client.
	let disposable = new LanguageClient('languageServerExample', 'Language Server Example', createServer, clientOptions).start();

	// Push the disposable to the context's subscriptions so that the 
	// client can be deactivated on extension deactivation
	context.subscriptions.push(disposable);
}


exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate
};
