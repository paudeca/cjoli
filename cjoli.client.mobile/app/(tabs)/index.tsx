import { ToastControl } from "@/components/CurrentToast";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
//import { ExternalLink } from "@tamagui/lucide-icons";
import {
  Anchor,
  Avatar,
  Circle,
  H2,
  H4,
  ListItem,
  Paragraph,
  ScrollView,
  Separator,
  SizableText,
  Text,
  View,
  XStack,
  YGroup,
  YStack,
} from "tamagui";
import axios from "axios";
import { Ranking } from "@/components/models";

type Person = {
  fullName: string;
  username: string;
  age: number;
  visits: number;
  status: string;
  role: string;
  avatar?: string;
};

const defaultData: Person[] = [
  {
    fullName: "Sara Smith",
    username: "@harry",
    age: 24,
    visits: 100,
    status: "Offline",
    role: "Admin",
  },
  {
    fullName: "Andy loren",
    username: "@andy_dev",
    age: 40,
    visits: 40,
    status: "Active",
    role: "Member",
  },
  {
    fullName: "Bob marley",
    username: "@massouddd",
    age: 45,
    visits: 20,
    status: "Active",
    role: "Admin",
  },
  {
    fullName: "Adam henry",
    username: "@john",
    age: 24,
    visits: 100,
    status: "Active",
    role: "Admin",
  },
  {
    fullName: "Andy loren",
    username: "@andy",
    age: 40,
    visits: 40,
    status: "Offline",
    role: "Member",
  },
  {
    fullName: "Massoud karimi",
    username: "@massoud",
    age: 45,
    visits: 20,
    status: "Active",
    role: "Member",
  },
  {
    fullName: "John",
    username: "@john",
    age: 24,
    visits: 100,
    status: "Active",
    role: "Admin",
  },
  {
    fullName: "Andy Doe",
    username: "@andy",
    age: 40,
    visits: 40,
    status: "Offline",
    role: "Admin",
  },
  {
    fullName: "Preston bennet",
    username: "@outworld",
    age: 45,
    visits: 20,
    status: "Active",
    role: "Admin",
  },
].map(
  (row, index) =>
    ({
      ...row,
      avatar:
        "https://upload.wikimedia.org/wikipedia/fr/a/a7/Lions_de_Wasquehal.png",
    } as Person)
);

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

  const { data: ranking } = useQuery(getRanking("rouen2025"));

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

      {/*<YStack flex={1} items="center" gap="$8" px="$5" py="$5" bg="$background">
        <YGroup bordered>
          <YGroup.Item>
            <ListItem bg="$background0">
              <XStack>
                <SizableText size="$8">1</SizableText>
                <YStack>
                  <XStack>
                    <Avatar circular>
                      <Avatar.Image
                        accessibilityLabel="Cam"
                        src="https://upload.wikimedia.org/wikipedia/fr/a/a7/Lions_de_Wasquehal.png"
                      />
                      <Avatar.Fallback backgroundColor="$blue10" />
                    </Avatar>

                    <Text mx="$2">Wasquehal</Text>
                  </XStack>
                  <XStack bg="red" width={240}>
                    <Text>1</Text>
                    <Text>2</Text>
                  </XStack>
                </YStack>
                <SizableText size="$8">1</SizableText>
              </XStack>
            </ListItem>
          </YGroup.Item>
          <YGroup.Item>
            <ListItem hoverTheme>Moon</ListItem>
          </YGroup.Item>
          <YGroup.Item>
            <ListItem hoverTheme>Sun</ListItem>
          </YGroup.Item>
          <YGroup.Item>
            <ListItem>Cloud</ListItem>
          </YGroup.Item>
          <YGroup.Item>
            <ListItem hoverTheme>Sun</ListItem>
          </YGroup.Item>
          <YGroup.Item>
            <ListItem>Cloud</ListItem>
          </YGroup.Item>
          <YGroup.Item>
            <ListItem hoverTheme>Sun</ListItem>
          </YGroup.Item>
        </YGroup>

        {/*<H2>Tamagui + Expo</H2>

        <ToastControl />

        <XStack
          items="center"
          justify="center"
          flexWrap="wrap"
          gap="$1.5"
          position="absolute"
          b="$8"
        >
          <Paragraph fontSize="$5">Add</Paragraph>

          <Paragraph fontSize="$5" px="$2" py="$1" color="$blue10" bg="$blue5">
            tamagui.config.ts
          </Paragraph>

          <Paragraph fontSize="$5">to root and follow the</Paragraph>

          <XStack
            items="center"
            gap="$1.5"
            px="$2"
            py="$1"
            rounded="$3"
            bg="$green5"
            hoverStyle={{ bg: "$green6" }}
            pressStyle={{ bg: "$green4" }}
          >
            <Anchor
              href="https://tamagui.dev/docs/core/configuration"
              textDecorationLine="none"
              color="$green10"
              fontSize="$5"
            >
              Configuration guide
            </Anchor>
          </XStack>

          <Paragraph fontSize="$5" text="center">
            to configure your themes and tokens.
          </Paragraph>
        </XStack>*/}
      {/*</YStack>*/}
    </ScrollView>
  );
}
