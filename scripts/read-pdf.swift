import Foundation
import PDFKit

struct CLIError: Error, CustomStringConvertible {
  let description: String
}

struct Options {
  var pdfPath: String?
  var singlePage: Int?
  var pageRange: ClosedRange<Int>?
  var outputPath: String?
  var json = false
}

func printUsage() {
  let usage = """
  Usage:
    swift scripts/read-pdf.swift <file.pdf> [--page N] [--pages A-B] [--out output.txt] [--json]

  Examples:
    npm run pdf:read -- src/data/books/winning-with-the-slow-but-venomous-italian-chapter-1.pdf --page 1
    npm run pdf:read -- src/data/books/winning-with-the-slow-but-venomous-italian-chapter-1.pdf --pages 1-3 --out /tmp/chapter1.txt
    npm run pdf:read -- src/data/books/winning-with-the-slow-but-venomous-italian-chapter-1.pdf --json
  """
  print(usage)
}

func parsePositiveInt(_ value: String, flag: String) throws -> Int {
  guard let intValue = Int(value), intValue > 0 else {
    throw CLIError(description: "Expected a positive integer after \(flag), got '\(value)'.")
  }
  return intValue
}

func parsePageRange(_ value: String) throws -> ClosedRange<Int> {
  let parts = value.split(separator: "-", maxSplits: 1).map(String.init)
  guard parts.count == 2 else {
    throw CLIError(description: "Expected page range in the form A-B, got '\(value)'.")
  }

  let start = try parsePositiveInt(parts[0], flag: "--pages")
  let end = try parsePositiveInt(parts[1], flag: "--pages")

  guard start <= end else {
    throw CLIError(description: "Invalid page range '\(value)': start must be <= end.")
  }

  return start...end
}

func parseArgs() throws -> Options {
  var options = Options()
  var index = 1
  let args = CommandLine.arguments

  while index < args.count {
    let arg = args[index]
    switch arg {
    case "--help", "-h":
      printUsage()
      exit(0)
    case "--page":
      index += 1
      guard index < args.count else {
        throw CLIError(description: "Missing value after --page.")
      }
      options.singlePage = try parsePositiveInt(args[index], flag: "--page")
    case "--pages":
      index += 1
      guard index < args.count else {
        throw CLIError(description: "Missing value after --pages.")
      }
      options.pageRange = try parsePageRange(args[index])
    case "--out":
      index += 1
      guard index < args.count else {
        throw CLIError(description: "Missing value after --out.")
      }
      options.outputPath = args[index]
    case "--json":
      options.json = true
    default:
      if arg.hasPrefix("--") {
        throw CLIError(description: "Unknown option '\(arg)'.")
      }
      if options.pdfPath != nil {
        throw CLIError(description: "Only one PDF path is supported. Got extra argument '\(arg)'.")
      }
      options.pdfPath = arg
    }
    index += 1
  }

  guard options.pdfPath != nil else {
    throw CLIError(description: "Missing PDF file path.")
  }

  if options.singlePage != nil && options.pageRange != nil {
    throw CLIError(description: "Use either --page or --pages, not both.")
  }

  return options
}

func makeOutput(document: PDFDocument, selectedPages: [Int], asJSON: Bool) throws -> String {
  let pageCount = document.pageCount
  let normalizedPages = selectedPages.filter { $0 >= 1 && $0 <= pageCount }

  if normalizedPages.count != selectedPages.count {
    throw CLIError(description: "Requested page is outside the PDF page count (\(pageCount)).")
  }

  let entries: [[String: Any]] = normalizedPages.map { pageNumber in
    let pageIndex = pageNumber - 1
    let text = document.page(at: pageIndex)?.string ?? ""
    return [
      "page": pageNumber,
      "text": text.trimmingCharacters(in: .whitespacesAndNewlines),
    ]
  }

  if asJSON {
    let payload: [String: Any] = [
      "file": document.documentURL?.path ?? "",
      "pageCount": pageCount,
      "pages": entries,
    ]
    let data = try JSONSerialization.data(withJSONObject: payload, options: [.prettyPrinted, .sortedKeys])
    guard let json = String(data: data, encoding: .utf8) else {
      throw CLIError(description: "Could not encode JSON output as UTF-8.")
    }
    return json + "\n"
  }

  var chunks: [String] = []
  for entry in entries {
    let page = entry["page"] as? Int ?? 0
    let text = entry["text"] as? String ?? ""
    chunks.append("--- Page \(page) ---\n\(text)")
  }
  return chunks.joined(separator: "\n\n") + "\n"
}

do {
  let options = try parseArgs()
  let pdfPath = options.pdfPath!
  let fileURL = URL(fileURLWithPath: pdfPath)

  guard FileManager.default.fileExists(atPath: fileURL.path) else {
    throw CLIError(description: "PDF file not found: \(fileURL.path)")
  }

  guard let document = PDFDocument(url: fileURL) else {
    throw CLIError(description: "Unable to open PDF file: \(fileURL.path)")
  }

  let pages: [Int]
  if let singlePage = options.singlePage {
    pages = [singlePage]
  } else if let range = options.pageRange {
    pages = Array(range)
  } else {
    pages = Array(1...document.pageCount)
  }

  let output = try makeOutput(document: document, selectedPages: pages, asJSON: options.json)

  if let outputPath = options.outputPath {
    let outputURL = URL(fileURLWithPath: outputPath)
    try FileManager.default.createDirectory(
      at: outputURL.deletingLastPathComponent(),
      withIntermediateDirectories: true
    )
    try output.write(to: outputURL, atomically: true, encoding: .utf8)
  } else {
    FileHandle.standardOutput.write(Data(output.utf8))
  }
} catch let error as CLIError {
  fputs("read-pdf error: \(error.description)\n", stderr)
  exit(1)
} catch {
  fputs("read-pdf unexpected error: \(error.localizedDescription)\n", stderr)
  exit(1)
}
