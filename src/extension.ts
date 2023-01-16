import * as vscode from 'vscode';
import { TreeProvider } from './tree';
import { HeaderDocumentProvider, SectionDocumentProvider, ProgramDocumentProvider } from './documents';

export const activate = (_context: vscode.ExtensionContext) => {
	const elfHeadersProvider = new TreeProvider();

	vscode.window.registerTreeDataProvider('elfHeaders', elfHeadersProvider);
	vscode.workspace.registerTextDocumentContentProvider('elf-reader-header', new HeaderDocumentProvider());
	vscode.workspace.registerTextDocumentContentProvider('elf-reader-program', new ProgramDocumentProvider());
	vscode.workspace.registerTextDocumentContentProvider('elf-reader-section', new SectionDocumentProvider());

	vscode.commands.registerCommand('elfReader.refresh', () => elfHeadersProvider.refresh())
	vscode.commands.registerCommand('elfReader.inspectHeader', inspectHeader);
	vscode.commands.registerCommand('elfReader.inspectProgram', inspectProgram);
	vscode.commands.registerCommand('elfReader.inspectSection', inspectSection);
};

const inspectHeader = async (path: string) => {
	const uri = vscode.Uri.parse(`elf-reader-header:${path}`);
	const doc = await vscode.workspace.openTextDocument(uri);
	await vscode.window.showTextDocument(doc, { preview: true });
};

const inspectProgram = async (path: string, id: number = 0) => {
	const uri = vscode.Uri.parse(`elf-reader-program:${path}?id=${id}`);
	const doc = await vscode.workspace.openTextDocument(uri);
	await vscode.window.showTextDocument(doc, { preview: true });
};

const inspectSection = async (path: string, id: number = 0) => {
	const uri = vscode.Uri.parse(`elf-reader-section:${path}?id=${id}`);
	const doc = await vscode.workspace.openTextDocument(uri);
	await vscode.window.showTextDocument(doc, { preview: true });
};
