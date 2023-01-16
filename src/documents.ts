import * as vscode from 'vscode';
import * as elfy from 'elfy';
import * as fs from 'fs';

import { formatMap, formatAddress, formatTable, formatBytes } from './format';

const DIVIDER = '----------------------------';

export class HeaderDocumentProvider implements vscode.TextDocumentContentProvider {
    onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
    onDidChange = this.onDidChangeEmitter.event;

    provideTextDocumentContent(uri: vscode.Uri): string {
        let elf = elfy.parse(fs.readFileSync(uri.fsPath));

        let content = `Header for ELF file ${uri.fsPath}:
${DIVIDER}
${formatMap(new Map<string, string>([
            ["Class", elf.class],
            ["Endian", elf.endian],
            ["Version", elf.version.toString()],
            ["OS / ABI", elf.osabi],
            ["ABI version", elf.abiversion],
            ["Type", elf.type],
            ["Machine", elf.machine],
            ["Entrypoint's address", formatAddress(elf.entry, elf.class)],
            ["Programs table header's address", formatAddress(elf.phoff, elf.class)],
            ["Sections table header's address", formatAddress(elf.shoff, elf.class)],
            ["Flags", formatAddress(elf.flags, elf.class)],
            ["Header's size", formatBytes(elf.ehsize)],
            ["Programs table header's size", formatBytes(elf.phentsize)],
            ["Programs table entries", elf.phnum.toString()],
            ["Sections table header's size", formatBytes(elf.shentsize)],
            ["Sections table entries", elf.shnum.toString()],
            ["Sections names index address", formatAddress(elf.shstrndx, elf.class)],
        ]), 60)}
${DIVIDER}
Programs (${elf.body.programs.length}):

${formatTable(
            [
                ["Type", "Offset", "Virtual address", "Physical address", "Image size", "Memory size", "Flags", "Alignement"],
                ...elf.body.programs.map(
                    (program) => [
                        program.type,
                        formatAddress(program.offset, elf.class),
                        formatAddress(program.vaddr, elf.class),
                        formatAddress(program.paddr, elf.class),
                        formatBytes(program.filesz),
                        formatBytes(program.memsz),
                        JSON.stringify(program.flags),
                        program.align.toString(),
                    ]
                )]
        )}
${DIVIDER}
Sections (${elf.body.sections.length}):

${formatTable([
            ["Name", "Type", "Address", "Offset", "Size", "Entry Size", "Flags", "Link", "Info", "Alignement"],
            ...elf.body.sections.map(
                (section) => {
                    return [
                        section.name,
                        section.type,
                        formatAddress(section.addr, elf.class),
                        formatAddress(section.off, elf.class),
                        formatBytes(section.size),
                        formatBytes(section.entsize),
                        JSON.stringify(section.flags),
                        formatAddress(section.link, elf.class),
                        section.info.toString(),
                        section.addralign.toString(),
                    ];
                }
            )]
        )}`;

        return content;
    }
}

export class ProgramDocumentProvider implements vscode.TextDocumentContentProvider {
    onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
    onDidChange = this.onDidChangeEmitter.event;

    provideTextDocumentContent(uri: vscode.Uri): string {
        let elf = elfy.parse(fs.readFileSync(uri.fsPath));
        let params = uri.query.split(',').map(param => (param.split("=")));
        let id = parseInt(params.find((params) => params[0] == "id")[1], 10);
        let program = elf.body.programs[id];

        let content = `Program ${id} for ELF file ${uri.fsPath}:
${DIVIDER}
${formatMap(new Map<string, string>([
            ["Type", program.type],
            ["Offset", formatAddress(program.offset, elf.class)],
            ["Virtual address", formatAddress(program.vaddr, elf.class)],
            ["Physical address", formatAddress(program.paddr, elf.class)],
            ["Size of the segment on the image", formatBytes(program.filesz)],
            ["Size of the segment in memory", formatBytes(program.memsz)],
            ["Flags", JSON.stringify(program.flags)],
            ["Alignement", program.align.toString()],
        ]), 60)}
${DIVIDER}
${program.data.toString()}
`;

        return content;
    }
}

export class SectionDocumentProvider implements vscode.TextDocumentContentProvider {
    onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
    onDidChange = this.onDidChangeEmitter.event;

    provideTextDocumentContent(uri: vscode.Uri): string {
        let elf = elfy.parse(fs.readFileSync(uri.fsPath));
        let params = uri.query.split(',').map(param => (param.split("=")));
        let id = parseInt(params.find((params) => params[0] == "id")[1], 10);
        let section = elf.body.sections[id];

        let content = `Section ${id} for ELF file ${uri.fsPath}:
${DIVIDER}
${formatMap(new Map<string, string>([
            ["Name", section.name],
            ["Type", section.type],
            ["Flags", JSON.stringify(section.flags)],
            ["Virtual address", formatAddress(section.addr, elf.class)],
            ["Offset", formatAddress(section.off, elf.class)],
            ["Size", formatBytes(section.size)],
            ["Associated section address", formatAddress(section.link, elf.class)],
            ["Additional information", section.info.toString()],
            ["Alignment", section.addralign.toString()],
            ["Entry size", formatBytes(section.entsize)],


        ]), 60)}
${DIVIDER}
${section.data.toString()}
`;

        return content;
    }
}
