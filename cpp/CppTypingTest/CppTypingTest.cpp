#include "CppTypingTest.h"

#include "CppKeywords_p.h"
#include "ScoreManager.h"

#include <array>
#include <chrono>
#include <iostream>
#include <sstream>
#include <span>
#include <string>

namespace SampleCode {

namespace {

// Utility function to put the current date into a std::string.
std::string GetDate() {
    auto today = std::chrono::system_clock::now();
    auto dp = std::chrono::floor<std::chrono::days>(today);
    auto ymd = std::chrono::year_month_day{dp};

    std::ostringstream os;
    os << static_cast<unsigned>(ymd.day()) 
        << "-" << static_cast<unsigned>(ymd.month()) 
        << "-" << static_cast<int>(ymd.year());
    return os.str();
}

// Utility to get input from command std::cin:
std::string GetInput() {
    std::string input;
    std::getline(std::cin, input);
    return input;
}

} // namespace

// Default location to store test score leaderboard.
const std::string CppTypingTest::sDefaultScoreFilename_{"cpp_typing_test_scores.txt"};

CppTypingTest::CppTypingTest(std::string score_file, std::size_t num_words)
    : num_words_(num_words)
    , score_file_(score_file) {
    // Clip the numWords to size of the keyword list if 
    // they are out of bounds. 0 is mapped to the full list.
    if (num_words_ == 0 || num_words_ > Cpp20Keywords.size()) {
        num_words_ = Cpp20Keywords.size();
    } 
}

// Main routine containing the test engine.
void CppTypingTest::Run() const {
    // Start screen.
    std::cout << "***********************\n";
    std::cout << "** Welcome to the C++ Timed Typing Test!! \n";
    std::cout << "***********************\n";
    
    // Deduce data file.
    std::string load_file;
    if (score_file_.empty()) {
        load_file = sDefaultScoreFilename_;
    } else {
        load_file = score_file_;
    }

    // RAII - file resource managed by the lifetime of this object
    ScoreManager sm(load_file);

    // Initial prompt.
    while (true) {
        std::cout << "Hit return to start the test, type 's' to show the leaderboard, or ctrl-c to abort: ";
        std::string input = GetInput();
        if (input == "s" || input == "S") {
            sm.PrintScores();
        } else {
            break;
        }
    }

    // Start timer
    auto start = std::chrono::system_clock::now();
    bool test_completed = true;
    size_t total_chars = 0;

    // Main loop - allow the user to type all words, or type XXX. 
    // (XXX is a secret developer option that allows the user to break out
    // early, while still running post-game logic.)
    auto span = std::span(Cpp20Keywords).first(num_words_);
    for (const auto& word : span) {
        std::string w_in;
        // Loop until the user types the word correctly, or types XXX to 
        // end the application early.
        while (true) {
            std::cout << word << "\n";
            w_in = GetInput();
            if (w_in == word) {
                // Add chars to total, count the return character.
                total_chars += word.length() + 1;
                break;
            } else if (w_in == "XXX") {
                // Secret debug option 
                break;
            }
        }

        // Exit to post-game logic.
        // An easter egg!
        if (w_in == "XXX")
            break;
    }

    // End timer.
    auto end = std::chrono::system_clock::now();
    std::chrono::duration<double> elapsed_seconds = end - start;

    // Check scores:
    std::cout << "Elapsed time: " << elapsed_seconds.count() << " seconds \n";
    const float wpm = 60.0 * static_cast<float>(total_chars) / (elapsed_seconds.count() * 5.0);
    std::cout << "WPM (# chars/5) = " << wpm << "\n\n";

    // Prompt for leaderboard inclusion.
    std::cout << "Add your initials to the leaderboard? (Y/N) \n";
    std::string input = GetInput();
    if (input == "y" || input == "Y") {
        std::cout << "Input initials: \n";
        std::string initials = GetInput();
        sm.PrintScoreRank(wpm);
        sm.AddScore(initials, wpm, GetDate());
        sm.Write();
        std::cout << "Current leaderboard:\n";
        sm.PrintScores();
    } 
}

} // SampleCode
