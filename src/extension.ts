import * as vscode from "vscode";
import { LinearClient } from "@linear/sdk";

// Place to user config

const config = vscode.workspace.getConfiguration();
const linearApiKey: string | undefined = config.get("todo.linearApi");
const projectSlug = config.get("todo.projectSlug");

const client1 = new LinearClient({
  apiKey: linearApiKey,
});

// client1.viewer.then((me) => {
//   return me.assignedIssues().then((myIssues) => {
//     if (myIssues.nodes.length) {
//       myIssues.nodes.map((issue) => console.log(issue));
//     } else {
//       console.log(`${me.displayName} has no issues`);
//     }
//   });
// });

async function createIssue(informationObject: {
  title: string;
  description: string;
}) {
  console.log(linearApiKey);
  console.log(projectSlug);
  const teams = await client1.teams();
  const projects = await client1.projects();
  const selectedProject = projects.nodes.find(
    (project) => project.slugId === projectSlug
  ) || { id: "" };
  const RCCO_TEAM = teams.nodes[0];

  if (RCCO_TEAM.id) {
    await client1.createIssue({
      projectId: selectedProject.id,
      teamId: RCCO_TEAM.id,
      title: `[TODO]: ${informationObject.title}`,
      description: `**Summary**\n\n**Todo**\n\n* [ ]${informationObject.description}\n\n**Screenshots**\n\n**Extra**`,
    });
  }
}

export function activate(context: vscode.ExtensionContext) {
  vscode.languages.registerHoverProvider(
    "javascript",
    new (class implements vscode.HoverProvider {
      provideHover(
        _document: vscode.TextDocument,
        _position: vscode.Position,
        _token: vscode.CancellationToken
      ): vscode.ProviderResult<vscode.Hover> {
        const commentCommandUri = vscode.Uri.parse(
          `command:todo-to-linear.createTask`
        );
        const contents = new vscode.MarkdownString(
          `[Create Todo](${commentCommandUri})`
        );
        // To enable command URIs in Markdown content, you must set the `isTrusted` flag.
        // When creating trusted Markdown string, make sure to properly sanitize all the
        // input content so that only expected command URIs can be executed
        contents.isTrusted = true;

        return new vscode.Hover(contents);
      }
    })()
  );

  vscode.workspace.onDidSaveTextDocument(() => {
    console.log("Document Save Trigger");
  });

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "todo-to-linear.helloWorld",
    () => {
      vscode.window.showInformationMessage("Hello World from Todo To Linear!");
    }
  );

  let hoverListener = vscode.commands.registerCommand(
    "todo-to-linear.createTask",
    () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      let editor = vscode.window.activeTextEditor || { selection: null };
      const selection = editor.selection;
      if (selection && !selection.isEmpty) {
        const selectionRange = new vscode.Range(
          selection.start.line,
          selection.start.character,
          selection.end.line,
          selection.end.character
        );
        const highlighted = editor.document.getText(selectionRange);
        const substractedStrings = highlighted.split(";");
        let informationObject = { title: "", description: "" };
        substractedStrings.forEach((element) => {
          informationObject.title = element.includes("@todo")
            ? element.split("@todo")[1]
            : informationObject.title;
          informationObject.description = element.includes("@description")
            ? element.split("@description")[1]
            : informationObject.description;
        });
        createIssue(informationObject);
      }
    }
  );

  context.subscriptions.push(hoverListener);
  context.subscriptions.push(disposable);
}

export function deactivate() {}
