import Nat8 "mo:base/Nat8";
import Nat "mo:base/Nat";
import Blob "mo:base/Blob";
import Array "mo:base/Array";

actor {
  let SubnetManager : actor {
    raw_rand() : async Blob;
  } = actor "aaaaa-aa"; // The management canister for randomness

  var lastCard : Nat = 1; // 初始上一张牌为1（代表A）

  public func draw_card(guess: Text) : async Text {
    let randomBlob = await SubnetManager.raw_rand();
    let randomBytes : [Nat8] = Blob.toArray(randomBlob);

    if (Array.size(randomBytes) == 0) {
      return "Failed to draw a card. Please try again.";
    };

    // 生成1到13之间的随机数，代表A到K的牌
    let newCard = Nat8.toNat(randomBytes[0]) % 13 + 1;
    
    let result = if ((guess == "higher" and newCard > lastCard) or (guess == "lower" and newCard < lastCard)) {
      "🎉 Correct! The new card was " # Nat.toText(newCard) # ". You guessed it right!"
    } else if (newCard == lastCard) {
      "It's a tie! The new card was also " # Nat.toText(newCard) # "."
    } else {
      "❌ Wrong guess! The new card was " # Nat.toText(newCard) # ". Try again!"
    };
    
    lastCard := newCard; // 更新上一张牌
    return result;
  };
};
