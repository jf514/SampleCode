#ifndef JASONS_SAMPLE_CODE_CPP_TYPING_TEST_CPP_TYPING_TEST_H
#define JASONS_SAMPLE_CODE_CPP_TYPING_TEST_CPP_TYPING_TEST_H
#pragma once

#include <cassert>
#include <map>
#include <string>

// Basic class for managing score records and their retreival.
class ScoreManager
{
public:
    explicit ScoreManager(const std::string& filename) :
        filename_(filename) {   
            load();
    }

    void addScore(const std::string& name, float score, const std::string& date);
    size_t getScoreRank(float score) const;
    bool write() const;
    void printScores() const;
    std::size_t numScores() const;

private:
    bool load();

    const std::string filename_;
    using ScoreInfo = std::pair<std::string, std::string>;
    std::multimap<float, ScoreInfo, std::greater<float>> scores_;
};

#endif // JASONS_SAMPLE_CODE_CPP_TYPING_TEST_CPP_TYPING_TEST_H