/* eslint-disable indent */
// @ts-ignore
import { useGesture } from "@use-gesture/react";
import { FamDiagram } from "basicprimitivesreact";
import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { PageFitMode, Enabled, NavigationMode } from "basicprimitives";
import SearchBar from "@/components/molecules/SearchBar";
import AppLayout from "@/components/Layouts/AppLayout";
import TreeCard from "@/components/molecules/TreeCard";
import { AiFillMinusSquare, AiFillPlusSquare } from "react-icons/ai";
import Button from "@/components/atoms/Button";
import { FaPlus } from "react-icons/fa";
import { emptyTreePresetData } from "@/components/constants";
import useFetchPersonFamilyTree from "@/base/hooks/api/useFetchPersonFamilyTree";
import Link from "next/link";
import PhotoFlowLoader from "@/components/molecules/PhotoFlow/PhotoFlowLoader";
import { cn } from "@/base/utils";

const FamilyTree = () => {
  const [searchTerms, setSearchTerms] = useState("");
  const [crop, setCrop] = useState({
    x: 0,
    y: 0,
    scale: 1,
  });
  const [zoomPercentage, setZoomPercentage] = useState(
    (crop.scale * 100).toFixed(0).toString()
  );
  const [treeData, setTreeData] = useState([]);
  const diagramRef = useRef(null);

  const bind = useGesture(
    {
      onDrag: ({ offset: [x, y] }) => {
        setCrop((prev) => ({
          ...prev,
          x,
          y,
        }));
      },
      onPinch: ({ offset: [d] }) => {
        setCrop((prev) => ({
          ...prev,
          scale: 1 + d / 80,
        }));
        setZoomPercentage((crop.scale * 100).toFixed(0).toString());
      },
    },
    {
      eventOptions: { passive: false },
    }
  );

  const router = useRouter();
  const { personId } = router.query;

  const { data, isLoading } = useFetchPersonFamilyTree(personId);

  const parentsIds =
    data && data.relationship
      ? data.relationship.links
          .filter((node) => node.id === personId)
          .map((person) => person.parents)
      : [];

  const getTreeDataPreset = () => {
    const ownerObject = {
      id: data?.user.personId,
      title: `${data?.user.firstName} ${data?.user.lastName}`,
      image: data?.user.profilePhotoUrl,
      parents: emptyTreePresetData.map((item) => item.id),
    };

    if (data && data.relationship) {
      const currentPerson = data.relationship.links.find(
        (item) => item.id === data.user.personId
      );

      let nodes = data.relationship.links;

      const dataWithoutOwner = data.relationship.links.filter(
        (node) => node.id !== data.user.personId
      );

      const dataWithoutSpouse = nodes.filter(
        (node) =>
          node.description !==
          `Spouse: ${data.user.firstName} ${data.user.lastName}`
      );

      const emptySpouse = {
        isEmpty: true,
        id: "empty-spouse",
        parents: [data.user.personId],
      };

      const ownerSpouse = data.relationship.links.filter(
        (node) =>
          node.description ===
          `Spouse: ${data.user.firstName} ${data.user.lastName}`
      );

      const ownerChildren = data.relationship.links.filter(
        (node) => node.parents?.[0] === data.user.personId
      );
      const libraryFormattedOwnerChildren = ownerChildren.map((child) => ({
        ...child,
        parents:
          ownerSpouse.length > 0 ? [ownerSpouse[0].id] : [data.user.personId],
      }));

      if (ownerSpouse === undefined) {
        nodes = [...nodes, emptySpouse];
      } else {
        nodes = [
          ...dataWithoutSpouse,
          { ...ownerSpouse[0], parents: [data.user.personId] },
        ];
      }

      if (ownerChildren.length > 0 && ownerSpouse.length > 0) {
        const dataWithoutChildren = dataWithoutSpouse.filter(
          (node) => node.parents?.[0] !== data.user.personId
        );

        nodes = [
          ...dataWithoutChildren,
          { ...ownerSpouse[0], parents: [data.user.personId] },
          ...libraryFormattedOwnerChildren,
        ];
      }

      // add empty placeholder parent if the current user has just one parent
      if (currentPerson && currentPerson.parents.length === 1) {
        const emptyParent = emptyTreePresetData[0];
        // update the currentperson's parent array with the empty parent id
        const currentPersonParentId = [
          ...currentPerson.parents,
          emptyParent.id,
        ];

        return [
          ...dataWithoutOwner,
          emptyParent,
          { ...ownerObject, parents: currentPersonParentId },
        ];
      }

      return nodes;
    }
    return [...emptyTreePresetData, ownerObject];
  };

  const handleClickToZoom = (type) => {
    if (type === "in") {
      setCrop((prev) => ({
        ...prev,
        scale: prev.scale + 0.1,
      }));
      setZoomPercentage((prev) => {
        const newPercentage = parseInt(prev, 10) + 10;
        return newPercentage.toString();
      });
    } else {
      setCrop((prev) => ({
        ...prev,
        scale: prev.scale - 0.1,
      }));
      setZoomPercentage((prev) => {
        const newPercentage = parseInt(prev, 10) - 10;
        return newPercentage.toString();
      });
    }
  };
  useEffect(() => {
    if (data) {
      const treeDataPreset = getTreeDataPreset();
      setTreeData(treeDataPreset);
    }
  }, [data]);

  console.log(treeData);

  const config = {
    pageFitMode: PageFitMode.AutoSize,
    enableMatrixLayout: true,
    minimumMatrixSize: 6,
    navigationMode: NavigationMode.CursorOnly,
    autoSizeMinimum: { width: 100, height: 100 },
    cursorItem: null,
    highlightItem: null,
    linesWidth: 3,
    linesColor: "#b39cf9",
    hasSelectorCheckbox: Enabled.False,
    normalLevelShift: 40,
    lineLevelShift: 25,
    normalItemsInterval: 300,
    lineItemsInterval: 30,
    enablePanning: true,
    defaultTemplateName: "info",
    templates: [
      {
        name: "info",
        itemSize: { width: 100, height: 110 },
        minimizedItemSize: { width: 3, height: 3 },
        itemBorderWidth: 0,
        minimizedItemBorderWidth: 0,
        // eslint-disable-next-line react/no-unstable-nested-components
        onItemRender: ({ context: itemConfig }) => {
          if (itemConfig.isEmpty) {
            return (
              // eslint-disable-next-line react/jsx-filename-extension
              <Link
                className={cn(
                  "flex h-full w-full flex-col items-center justify-center gap-1 rounded-md bg-[#c4c4c4]"
                )}
                href={`/dashboard/tree/member/add?step=bio-data&ref=${personId}`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-4 border-[#212121]">
                  <FaPlus className="text-xl text-[#212121]" />
                </div>
                <p className="text-[10px] text-[#212121]">
                  {itemConfig.id === "empty-spouse"
                    ? "Add Member"
                    : "Add Parent"}
                </p>
              </Link>
            );
          }

          return (
            <TreeCard
              hasAddButton={
                itemConfig.id === personId && itemConfig.parents.length > 0
              }
              onPlusClick={() =>
                router.push(
                  `/dashboard/tree/member/add?step=bio-data&ref=${itemConfig.parents[0]}`
                )
              }
              identity={
                itemConfig.id === personId
                  ? "you"
                  : itemConfig.parents?.includes(parentsIds[0])
                  ? "siblings"
                  : itemConfig.parents?.includes(personId)
                  ? "spouse"
                  : "parent"
              }
              id={itemConfig.id}
              imageSrc={
                itemConfig.id === personId
                  ? data.user.profilePhotoUrl
                  : itemConfig.image
              }
              personName={itemConfig.title}
              // dob="Wed Jul 12 2023"
              // age={20}
            />
          );
        },
      },
    ],
    items: treeData,
  };
  return (
    <AppLayout hideSpirals showUser image="" name="Jane Doe">
      <section className="container min-h-screen">
        <div className="w-full mx-auto mt-5 md:w-2/4">
          <SearchBar
            value={searchTerms}
            onChange={(value) => setSearchTerms(value)}
            onSearch={(value) => router.push(`/search?q=${value}`)}
            placeholder="Explore other families "
          />
        </div>
        {/* Dashboard Header Section */}
        <div className="z-10 flex justify-between w-full">
          <h1 className="mt-5 text-2xl font-normal text-center text-slate-700">
            Your Family Tree
          </h1>
          <div className="flex gap-8">
            <div className="flex items-center gap-1">
              <button
                title="zoom out 10% "
                onClick={() => handleClickToZoom("out")}
                type="button"
              >
                <AiFillMinusSquare
                  fill="hsla(255, 83%, 53%, 1)"
                  className="text-2xl cursor-pointer"
                />
              </button>
              <div className="flex px-2 rounded-lg w-max bg-midpup">
                <input
                  className="w-10 py-2 text-center bg-transparent outline-none"
                  value={zoomPercentage}
                  onChange={(e) => setZoomPercentage(e.target.value)}
                  type="text"
                />
                <span className="py-2 text-center">%</span>
              </div>
              <button
                title="zoom in 10% "
                onClick={() => handleClickToZoom("in")}
                type="button"
              >
                <AiFillPlusSquare
                  fill="hsla(255, 83%, 53%, 1)"
                  className="text-2xl cursor-pointer"
                />
              </button>
            </div>
            <Button
              href={`/dashboard/tree/${personId}/share`}
              intent="outline"
              className="!h-max rounded-full py-2"
            >
              Share Tree <FaPlus />
            </Button>
          </div>
        </div>

        <div className="flex h-[calc(100vh-20px)] items-start justify-center overflow-hidden py-8">
          {isLoading && <PhotoFlowLoader />}
          {data && (
            <div
              {...bind()}
              className="relative cursor-pointer"
              ref={diagramRef}
              style={{
                top: crop.y,
                left: crop.x,
                transform: `scale(${crop.scale})`,
                touchAction: "none",
              }}
            >
              <FamDiagram cursorItem={null} centerOnCursor config={config} />
            </div>
          )}
        </div>
      </section>
    </AppLayout>
  );
};

export default FamilyTree;