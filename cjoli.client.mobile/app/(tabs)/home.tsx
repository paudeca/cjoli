import { ToastControl } from "@/components/CurrentToast";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { Avatar, Circle, ScrollView, Text, View, XStack } from "tamagui";
import axios from "axios";
//import { Ranking } from "@/components/models";
import { Ranking } from "@@/models";
import { AppState } from "react-native";

const StatusButton = ({ status }: { status: string }) => {
  return (
    <View
      flexDirection="row"
      alignItems="center"
      gap="$2"
      theme={"green"}
      backgroundColor="$color6"
      borderRadius={1000_000_000}
      px="$2"
      py="$1"
    >
      <Circle size={10} backgroundColor="$color10" />
      <Text color="$color10" fontWeight="$2">
        {status}
      </Text>
    </View>
  );
};

const url = "https://cjoliserver.azurewebsites.net";

export default function TabOneScreen() {
  const getRanking = useCallback(
    (uid: string) =>
      queryOptions({
        queryKey: ["getRanking", uid],
        queryFn: async () => {
          const ranking = await axios.get<Ranking>(
            `${url}/cjoli/${uid}/ranking`
          );
          return ranking.data || [];
        },
      }),
    []
  );

  const { data: ranking, refetch } = useQuery(getRanking("rouen2025"));

  useEffect(() => {
    const u = AppState.addEventListener("change", (a) => {
      console.log("refetch");
      a == "active" && refetch();
    });
    return () => u.remove();
  });

  if (!ranking) {
    return <View />;
  }

  const phase = ranking.tourney.phases[0];
  const pos = 2;
  const squad = phase.squads[pos];

  return (
    <ScrollView>
      <View
        width="100%"
        flexDirection="column"
        justifyContent="center"
        gap="$5"
        paddingVertical="$6"
      >
        {ranking.scores.scoreSquads[pos].scores.map((score, i) => {
          const positionId = score.positionId;
          const position = squad.positions.find((p) => p.id == positionId);
          const team = ranking.tourney.teams.find(
            (t) => t.id == position?.teamId
          )!;
          return (
            <View
              key={i}
              borderRadius="$4"
              borderWidth="$1"
              borderColor="$borderColor"
              flex={1}
              alignSelf="stretch"
              width="100%"
              gap="$2"
              paddingTop="$2"
            >
              <XStack
                items="center"
                paddingBlockStart="$1"
                marginStart="$3"
                marginInlineStart="$3"
                gap="$2"
              >
                <Avatar circular size="$3">
                  <Avatar.Image
                    accessibilityLabel="Profile image"
                    src={team.logo}
                  />
                  <Avatar.Fallback backgroundColor="$blue10" />
                </Avatar>
                <View justify="space-between">
                  <Text>{team.name}</Text>
                  <Text fontSize="$3" color="$blue10">
                    {team.shortName}
                  </Text>
                </View>
                <View marginStart="auto" paddingEnd="$3">
                  <StatusButton status={score.total + ""} />
                </View>
              </XStack>

              <View height={2} backgroundColor="$borderColor" />

              <View>
                <View
                  flexDirection="row"
                  justify="space-evenly"
                  marginInline="$3"
                  paddingEnd="$2"
                >
                  <Text>PJ:{score.game}</Text>
                  <Text>V:{score.win}</Text>
                  <Text>N:{score.neutral}</Text>
                  <Text>D:{score.loss}</Text>
                  <Text>BP:{score.goalFor}</Text>
                  <Text>BC:{score.goalAgainst}</Text>
                  <Text>GA:{score.goalDiff}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
