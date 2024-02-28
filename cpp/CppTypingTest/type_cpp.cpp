#include <iostream>
#include <string>
#include <unistd.h>
#include "CppTypingTest.h"

namespace {

// Prints usage string below.
void PrintUsage(const std::string& progName) {
  std::string usage =
      "usage: " + progName +
      " [-n num_words] [-f score_file] [-p]\n"
      "\n"
      "\t -n num_words: Number of words to use in test, if less than total.\n"
      "\t               (Must be less than the total number of keywords and greater than 0.\n"
      "\t                Ignored otherwise.)\n"
      "\n"
      "\t -f score_file: File to load scores from, creates if it doesn't exist.\n"
      "\t               (If not specified, uses default)\n"
      "\n"
      "\t -p: Print the default score file name.\n\n";

  std::cerr << usage;
}

}  // namespace

int main(int argc, char* argv[]) {
  int numWords = 0;
  std::string scoreFile;
  bool printDefaultScoreFile = false;

  // Parse command-line options
  const std::string progName(argv[0]);
  int opt;
  while ((opt = getopt(argc, argv, "n:f:p")) != -1) {
    switch (opt) {
      case 'n':
        numWords = std::stoi(optarg);
        if (numWords < 0) {
          PrintUsage(progName);
          return EXIT_FAILURE;
        }
        break;
      case 'f':
        scoreFile = optarg;
        break;
      case 'p':
        SampleCode::CppTypingTest::PrintDefaultScorefile();
        return EXIT_SUCCESS;
        break;
      case '?':  // If unknown option or missing argument
      default:
        PrintUsage(progName);
        return EXIT_FAILURE;
    }
  }

  // Handle extra args not handled above, e.g.
  // ./test extra_arg will be caught here, 
  // since extra_arg isn't preceded by a "-",
  // (which is handled by "?" above)
  if (optind != argc) {
    PrintUsage(progName);
    return EXIT_FAILURE;
  }

  // Call the test handler.
  SampleCode::CppTypingTest test(scoreFile, numWords);
  test.Run();

  return EXIT_SUCCESS;
}
