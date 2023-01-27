// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { LinearClient } from '@linear/sdk'

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

const client1 = new LinearClient({
	apiKey: 'lin_api_kS0mGj8F6PjzfECCnSf5EaOZWux2AP66NfxlcDnC',
  });
  

  client1.viewer.then(me => {
	return me.assignedIssues().then(myIssues => {
	  if (myIssues.nodes.length) {
		myIssues.nodes.map(issue => console.log(`${me.displayName} has issue: ${issue.title}`));
	  } else {
		console.log(`${me.displayName} has no issues`);
	  }
	});
  });

async function createIssue() {
	const teams = await client1.teams();
	const projects = await client1.projects()
	const gdaProject = projects.nodes[0];
	const RCCOTeam = teams.nodes[0];
  if (RCCOTeam.id) {
	await client1.issueCreate({ projectId: gdaProject.id ,teamId: RCCOTeam.id, title: "My Created Issue" });
  }
  }

  

export function activate(context: vscode.ExtensionContext) {

	// Api key authentication
  
  	createIssue();

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "todo-to-linear" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('todo-to-linear.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Todo To Linear!');
	});

	context.subscriptions.push(disposable);
}



// This method is called when your extension is deactivated
export function deactivate() {}


