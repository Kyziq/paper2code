import pc from 'picocolors';

class Logger {
  info(message: string): void {
    console.log(pc.blue(`💡 [INFO] ${message}`));
  }

  success(message: string): void {
    console.log(pc.green(`✅ [SUCCESS] ${message}`));
  }

  warning(message: string): void {
    console.log(pc.yellow(`⚠️ [WARNING] ${message}`));
  }

  error(message: string): void {
    console.error(pc.red(`❌ [ERROR] ${message}`));
  }

  debug(message: string): void {
    if (process.env.DEBUG) {
      console.log(pc.magenta(`🐛 [DEBUG] ${message}`));
    }
  }

  api(message: string): void {
    console.log(pc.cyan(`🔗 [API] ${message}`));
  }

  logDetailedOCRResults(fullTextAnnotation: any, type: 'image' | 'pdf'): void {
    console.log('');
    this.info(pc.cyan(`----- Detailed OCR Results (${type.toUpperCase()}) -----`));

    fullTextAnnotation.pages?.forEach((page: any, pageIndex: number) => {
      this.info(pc.cyan(`----- Page ${pageIndex + 1} -----`));
      page.blocks?.forEach((block: any, blockIndex: number) => {
        this.info(
          pc.yellow(`Block ${blockIndex + 1} - Confidence: ${block.confidence.toFixed(2)}`),
        );
        block.paragraphs?.forEach((paragraph: any, paragraphIndex: number) => {
          this.info(
            pc.green(
              `\tParagraph ${paragraphIndex + 1} - Confidence: ${paragraph.confidence.toFixed(2)}`,
            ),
          );
          paragraph.words?.forEach((word: any, wordIndex: number) => {
            const wordText = word.symbols?.map((s: any) => s.text).join('') ?? '';
            this.info(
              pc.blue(
                `\t\tWord ${wordIndex + 1}: ${wordText} - Confidence: ${word.confidence.toFixed(2)}`,
              ),
            );
            word.symbols?.forEach((symbol: any, symbolIndex: number) => {
              this.info(
                pc.magenta(
                  `\t\t\tSymbol ${symbolIndex + 1}: ${symbol.text} - Confidence: ${symbol.confidence.toFixed(2)}`,
                ),
              );
            });
          });
        });
      });
    });

    console.log('');
  }
}

export const logger = new Logger();
