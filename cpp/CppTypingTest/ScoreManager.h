#ifndef JASONS_SAMPLE_CODE_CPP_TYPING_TEST_CPP_TYPING_TEST_H
#define JASONS_SAMPLE_CODE_CPP_TYPING_TEST_CPP_TYPING_TEST_H
#pragma once

#include <map>
#include <string>

namespace SampleCode {

// Basic class for managing score records and their retreival.
class ScoreManager
{
    public:
        // Constructor meant to enforce RIAA
        explicit ScoreManager(const std::string& filename) :
            score_filename_(filename) {   
                load();
        }

        // Add score to current score file.
        void addScore(const std::string& name, float score, const std::string& date);
        // Prints score rank for current score file.
        void printScoreRank(float score) const;
        // Write file to disk.
        bool write() const;
        // Print scores to std::out
        void printScores() const;
        // Get current number of scores in file.
        std::size_t numScores() const;

    private:
        // Loads the current score file.
        bool load();

        // File were scores are retrieved from/stored. 
        const std::string score_filename_;

        struct ScoreInfo {
            std::string name;
            std::string date;
        };

        std::multimap<float, ScoreInfo, std::greater<float>> scores_;
};

} // SampleCode

#endif // JASONS_SAMPLE_CODE_CPP_TYPING_TEST_CPP_TYPING_TEST_H