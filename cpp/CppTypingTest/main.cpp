
#include "CppTypingTest.h"

#include <iostream>
#include <string>
#include <unistd.h>

// Prints useage string below.
void printUseage(std::string progName){
    std::string useage = 
    "usage: " + progName + " [-n num_words] [-f score_file] [-pd]\n"
    "\n"
    "\t -n num_words: Number of words to use in test, if less than total.\n"
    "\t               (Must be less than the total # of keywords, and greater than 0.\n"
    "\t                Ignored otherwise.)\n"
    "\n"           
    "\t -f score_file: File to load scores from, creates if it doesn't exist.\n"
    "\t               (If not specified, uses default)\n"
    "\n"
    "\t -p: Print the default score file name.\n\n";

    std::cerr << useage;
}

int main(int argc, char* argv[]) {

    int numWords = 0;
    std::string scoreFile;
    bool printDefaultScoreFile = false;

    // Parse command-line options
    std::string progName(argv[0]);
    int opt;
    while ((opt = getopt(argc, argv, "n:f:p")) != -1) {
        switch (opt) {
            case 'n':
                numWords = std::stoi(optarg);
                if(numWords < 1){
                    printUseage(progName);
                    abort();
                }
                break;
            case 'f':
                scoreFile = (char*)(optarg);
                std::cout << "SF: " << scoreFile << "\n";
                break;
            case 'p':
                printDefaultScoreFile = true;
                break;
            case '?': // If unknown option or missing argument
                printUseage(progName);
                return EXIT_FAILURE;
            default:
                printUseage(progName);
                abort();
        }
    }

    TypingTest::CppTypingTest test(scoreFile, numWords);
    test.Run();

    return EXIT_SUCCESS;
}