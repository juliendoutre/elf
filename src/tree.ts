import * as vscode from 'vscode';
import * as fs from 'fs';
import * as elfy from 'elfy';

export class TreeProvider implements vscode.TreeDataProvider<Header> {
    elf: any;
    uri: vscode.Uri;
    strings = [];

    getTreeItem = (element: Header): vscode.TreeItem => element;

    getChildren = (element?: Header | Section | Program | String): Thenable<Header[]> => {
        if (this.uri && this.elf) {
            if (element) {
                if (element instanceof ProgramsHeader) {
                    return Promise.resolve(this.elf.body.programs.map((_, index) => new Program(this.uri, index)));
                } else if (element instanceof SectionsHeader) {
                    return Promise.resolve(this.elf.body.sections.map((section, index) => new Section(this.uri, index, section.name)));
                } else if (element instanceof StringsHeader) {
                    return Promise.resolve(this.strings.map((string) => new String(string)));
                } else {
                    return Promise.resolve([]);
                }
            } else {
                return Promise.resolve([
                    new FileHeader(this.uri),
                    new ProgramsHeader(),
                    new SectionsHeader(),
                    new StringsHeader(),
                ]);
            }
        } else {
            return Promise.resolve([]);
        }

    };

    private _onDidChangeTreeData: vscode.EventEmitter<Header | undefined | null | void> = new vscode.EventEmitter<Header | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<Header | undefined | null | void> = this._onDidChangeTreeData.event;

    refresh = () => {
        const input = vscode.window.tabGroups.activeTabGroup.activeTab?.input;
        let openFileHeadePanel = false;

        if (input && input instanceof vscode.TabInputText) {
            if (!this.elf) {
                openFileHeadePanel = true;
            }

            this.uri = input.uri;
            this.elf = elfy.parse(fs.readFileSync(this.uri.fsPath));

            this.strings = [];
            this.elf.body.sections.filter((section) => section.type == 'strtab' || section.type == 'dynstr').forEach((section) => {
                section.data.toString().split('\0').forEach((string) => {
                    this.strings.push(string);
                })
            });

            this._onDidChangeTreeData.fire();

            if (openFileHeadePanel) {
                vscode.commands.executeCommand('elfReader.inspectHeader', this.uri.fsPath);
            }
        }
    }
}

type Header = FileHeader | ProgramsHeader | SectionsHeader | StringsHeader;

class FileHeader extends vscode.TreeItem {
    constructor(uri: vscode.Uri) {
        super('header', vscode.TreeItemCollapsibleState.None);
        this.command = { title: 'inspect', command: 'elfReader.inspectHeader', arguments: [uri.fsPath] };
    }
}

class ProgramsHeader extends vscode.TreeItem {
    constructor() {
        super('programs', vscode.TreeItemCollapsibleState.Expanded);
    }
}

class Program extends vscode.TreeItem {
    constructor(uri: vscode.Uri, id: number) {
        super(id.toString(), vscode.TreeItemCollapsibleState.None);
        this.command = { title: 'inspect', command: 'elfReader.inspectProgram', arguments: [uri.fsPath, id] };
    }
}

class SectionsHeader extends vscode.TreeItem {
    constructor() {
        super('sections', vscode.TreeItemCollapsibleState.Expanded);
    }
}

class Section extends vscode.TreeItem {
    constructor(uri: vscode.Uri, id: number, name: string) {
        super(name, vscode.TreeItemCollapsibleState.None);
        this.command = { title: 'inspect', command: 'elfReader.inspectSection', arguments: [uri.fsPath, id] };
    }
}

class StringsHeader extends vscode.TreeItem {
    constructor() {
        super('strings', vscode.TreeItemCollapsibleState.Collapsed);
    }
}

class String extends vscode.TreeItem {
    constructor(name: string) {
        super(name, vscode.TreeItemCollapsibleState.None);
    }
}
