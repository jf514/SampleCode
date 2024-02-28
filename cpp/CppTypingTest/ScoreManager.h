#ifndef JASONS_SAMPLE_CODE_CPP_TYPING_TEST_CPP_TYPING_TEST_H_
#define JASONS_SAMPLE_CODE_CPP_TYPING_TEST_CPP_TYPING_TEST_H_

#include <map>
#include <string>

namespace SampleCode {

// Basic class for managing score records and their retrieval.
class ScoreManager {
public:
    // Constructor meant to enforce RAII
    explicit ScoreManager(const std::string& filename) :
        score_filename_(filename) {
            Load();
    }

    // Add score to the current score file.
    void AddScore(const std::string& name, float score, const std::string& date);
    // Print score rank for the current score file.
    void PrintScoreRank(float score) const;
    // Write file to disk.
    bool Write() const;
    // Print scores to std::out.
    void PrintScores() const;
    // Get the current number of scores in the file.
    std::size_t NumScores() const;

private:
    // Loads the current score file.
    bool Load();

    // File where scores are retrieved from/stored. 
    const std::string score_filename_;

    struct ScoreInfo {
        std::string name;
        std::string date;
    };

    std::multimap<float, ScoreInfo, std::greater<float>> scores_;
};

} // namespace SampleCode

#endif // JASONS_SAMPLE_CODE_CPP_TYPING_TEST_CPP_TYPING_TEST_H_
